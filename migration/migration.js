// migration.js - Versão Melhorada
const { decryptPassword } = require("./utils/criptografiaUser");
const bcrypt = require("bcrypt");

// Configurações de performance
const BATCH_SIZE = 1000;
const CONCURRENT_OPERATIONS = 5;
const HASH_ROUNDS = 10;
const QUERY_TIMEOUT = 30000; // 30 segundos

// Função auxiliar otimizada para Firebird com pool de conexões
function executeFirebirdQueryOptimized(firebirdPool, query) {
  return new Promise((resolve, reject) => {
    firebirdPool.get((err, db) => {
      if (err) {
        console.error("❌ Erro ao obter conexão do pool Firebird:", err);
        return reject(err);
      }

      const timeoutId = setTimeout(() => {
        db.detach();
        reject(new Error("Query timeout"));
      }, QUERY_TIMEOUT);

      db.query(query, (err, result) => {
        clearTimeout(timeoutId);
        db.detach();
        if (err) {
          console.error("❌ Erro ao executar consulta no Firebird:", err);
          return reject(err);
        }
        resolve(result || []);
      });
    });
  });
}

// Função para processar em lotes
async function processBatch(items, batchProcessor, batchSize = BATCH_SIZE) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(
      `📦 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        items.length / batchSize
      )} (${batch.length} itens)`
    );

    try {
      const batchResult = await batchProcessor(batch);
      results.push(...batchResult);
    } catch (error) {
      console.error(
        `❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`,
        error.message
      );
      // Continua processando outros lotes mesmo com erro
      results.push({ success: 0, errors: batch.length });
    }

    // Pequena pausa para não sobrecarregar o banco
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

// Função melhorada para inserção em lote no PostgreSQL
async function insertBatchPostgres(
  postgresPool,
  table,
  columns,
  values,
  conflictAction = ""
) {
  if (values.length === 0) return { success: 0, errors: 0 };

  const placeholders = values
    .map(
      (_, index) =>
        `(${columns
          .map((_, colIndex) => `$${index * columns.length + colIndex + 1}`)
          .join(", ")})`
    )
    .join(", ");

  const flatValues = values.flat();

  const query = `
    INSERT INTO ${table} (${columns.join(", ")}) 
    VALUES ${placeholders}
    ${conflictAction}
  `;

  try {
    const result = await postgresPool.query(query, flatValues);
    return { success: result.rowCount, errors: 0 };
  } catch (error) {
    console.error(`❌ Erro no batch insert para ${table}:`, error.message);

    // Se for erro de constraint única, tenta inserção individual
    if (
      error.message.includes("unique constraint") ||
      error.message.includes("ON CONFLICT")
    ) {
      console.log(`🔄 Tentando inserção individual para ${table}...`);
      return await insertIndividualPostgres(
        postgresPool,
        table,
        columns,
        values
      );
    }

    return { success: 0, errors: values.length };
  }
}

// Função para inserção individual (fallback)
async function insertIndividualPostgres(postgresPool, table, columns, values) {
  let success = 0;
  let errors = 0;

  for (const value of values) {
    try {
      const placeholders = columns
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const query = `INSERT INTO ${table} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;

      await postgresPool.query(query, value);
      success++;
    } catch (error) {
      // Ignora erros de duplicata silenciosamente
      if (
        !error.message.includes("duplicate key") &&
        !error.message.includes("already exists")
      ) {
        console.warn(
          `⚠️ Erro ao inserir registro individual em ${table}:`,
          error.message
        );
      }
      errors++;
    }
  }

  return { success, errors };
}

// Migração de usuários com correções
async function migrateUsers(firebirdPool, postgresPool) {
  console.log("🚀 Iniciando migração OTIMIZADA de usuários...");

  try {
    const fdbQuery = "SELECT NOME, EMAIL, SENHA FROM USUARIO WHERE ATIVO = 'S'";
    const users = await executeFirebirdQueryOptimized(firebirdPool, fdbQuery);

    if (users.length === 0) {
      console.log("🟡 Nenhum usuário encontrado no Firebird para migrar.");
      return { success: 0, errors: 0 };
    }

    console.log(`ℹ️ Encontrados ${users.length} usuários para migrar.`);

    // Preparar dados em paralelo
    const userPromises = users.map(async (user) => {
      try {
        if (!user.SENHA) return null;

        const encryptedPassword = user.SENHA.toString().trim();
        const plainTextPassword = decryptPassword
          ? decryptPassword(encryptedPassword)
          : encryptedPassword;
        const hashedPassword = await bcrypt.hash(
          plainTextPassword,
          HASH_ROUNDS
        );

        // Gerar email único se não existir
        const email =
          user.EMAIL ||
          `${user.NOME.toLowerCase().replace(
            /\s+/g,
            ""
          )}@dashboardfinanceiro.com`;

        return [user.NOME, email, hashedPassword];
      } catch (error) {
        console.warn(
          `⚠️ Erro ao processar usuário ${user.NOME}:`,
          error.message
        );
        return null;
      }
    });

    // Processar em lotes com limite de concorrência
    const processedUsers = [];
    for (let i = 0; i < userPromises.length; i += CONCURRENT_OPERATIONS) {
      const batch = userPromises.slice(i, i + CONCURRENT_OPERATIONS);
      const batchResults = await Promise.all(batch);
      processedUsers.push(...batchResults.filter((user) => user !== null));
    }

    console.log(
      `📝 ${processedUsers.length} usuários processados, iniciando inserção em lote...`
    );

    // Inserção em lotes - CORRIGIDO: sem ON CONFLICT se não há constraint
    const batchProcessor = async (batch) => {
      // Primeiro tenta sem ON CONFLICT
      const result = await insertBatchPostgres(
        postgresPool,
        "usuario",
        ["name", "email", "senha"],
        batch
      );
      console.log(
        `✅ Lote inserido: ${result.success} sucessos, ${result.errors} erros`
      );
      return [result];
    };

    const results = await processBatch(
      processedUsers,
      batchProcessor,
      BATCH_SIZE
    );

    const totalSuccess = results.reduce((sum, r) => sum + (r.success || 0), 0);
    const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);

    console.log(
      `✅ Migração de usuários concluída: ${totalSuccess} migrados, ${totalErrors} erros`
    );
    return { success: totalSuccess, errors: totalErrors };
  } catch (error) {
    console.error("❌ Erro durante migração otimizada de usuários:", error);
    throw error;
  }
}

// Migração de cidades/estados (já estava funcionando)
async function migrateCidadeEstado(firebirdPool, postgresPool) {
  console.log("🚀 Iniciando migração OTIMIZADA de Cidade Estados...");

  try {
    const fdbQuery =
      "SELECT ID_MUNICIPIO AS ID, MUNICIPIO AS NOMECIDADE, UF AS NOMEESTADO FROM MUNICIPIO";
    const cidadesEstados = await executeFirebirdQueryOptimized(
      firebirdPool,
      fdbQuery
    );

    if (cidadesEstados.length === 0) {
      console.log(
        "🟡 Nenhum Cidade Estado encontrado no Firebird para migrar."
      );
      return { success: 0, errors: 0 };
    }

    console.log(
      `ℹ️ Encontrados ${cidadesEstados.length} Cidade Estados para migrar.`
    );

    const processedData = cidadesEstados.map((uf) => [
      uf.ID,
      uf.NOMECIDADE,
      uf.NOMEESTADO,
    ]);

    const batchProcessor = async (batch) => {
      const result = await insertBatchPostgres(
        postgresPool,
        "cidadeestado",
        ["id", "nomecidade", "nomeestado"],
        batch,
        `ON CONFLICT (id) DO UPDATE SET 
         nomecidade = EXCLUDED.nomecidade, 
         nomeestado = EXCLUDED.nomeestado`
      );
      console.log(
        `✅ Lote de cidades/estados inserido: ${result.success} sucessos, ${result.errors} erros`
      );
      return [result];
    };

    const results = await processBatch(
      processedData,
      batchProcessor,
      BATCH_SIZE
    );

    const totalSuccess = results.reduce((sum, r) => sum + (r.success || 0), 0);
    const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);

    console.log(
      `✅ Migração de cidades/estados concluída: ${totalSuccess} migrados, ${totalErrors} erros`
    );
    return { success: totalSuccess, errors: totalErrors };
  } catch (error) {
    console.error(
      "❌ Erro durante migração otimizada de cidades/estados:",
      error
    );
    throw error;
  }
}

// Migração de clientes/fornecedores com correção de duplicatas
async function migrateCliFornec(firebirdPool, postgresPool) {
  console.log("🚀 Iniciando migração OTIMIZADA de Clientes/Fornecedores...");

  try {
    const fdbQuery = `
      SELECT 
          X.CGC,
          X.RAZAOSOCIAL,
          X.NOMEFANTASIA,
          X.NUMEROEND,
          X.EMAIL,
          X.CEP,
          X.RUA,
          X.BAIRRO,
          X.IDCIDADEESTADO,
          X.NUMEROCEL
      FROM (
          SELECT 
              F.CGCFORNEC AS CGC,
              F.RAZAOFORNEC AS RAZAOSOCIAL,
              F.NOMEFANTFORNEC AS NOMEFANTASIA,
              F.NUMEROEND AS NUMEROEND,
              F.EMAILFORNEC AS EMAIL,
              F.CEPFORNEC AS CEP,
              F.ENDFORNEC AS RUA,
              F.BAIRROFORNEC AS BAIRRO,
              F.ID_MUNICIPIO AS IDCIDADEESTADO,
              F.FONE1FORNEC AS NUMEROCEL
          FROM FORNECEDOR F
          WHERE F.CGCFORNEC IS NOT NULL AND F.CGCFORNEC != ''
          UNION
          SELECT
              C.CGCCLI AS CGC,
              C.RAZSOCCLI AS RAZAOSOCIAL,
              C.NOMFANTCLI AS NOMEFANTASIA,
              C.NUMEROEND AS NUMEROEND,
              C.EMAILCLI AS EMAIL,
              C.CEPCLI AS CEP,
              C.ENDCLI AS RUA,
              C.BAIRROCLI AS BAIRRO,
              C.ID_MUNICIPIO AS IDCIDADEESTADO,
              C.FONE1CLI AS NUMEROCEL
          FROM CLIENTE C
          WHERE C.CGCCLI IS NOT NULL AND C.CGCCLI != ''
      ) X
    `;

    const records = await executeFirebirdQueryOptimized(firebirdPool, fdbQuery);

    if (records.length === 0) {
      console.log(
        "🟡 Nenhum Cliente/Fornecedor encontrado no Firebird para migrar."
      );
      return { success: 0, errors: 0 };
    }

    console.log(
      `ℹ️ Encontrados ${records.length} Clientes/Fornecedores para migrar.`
    );

    // CORREÇÃO: Remover duplicatas por CGC ANTES do processamento
    const uniqueRecords = [];
    const seenCgcs = new Set();

    for (const record of records) {
      const cgc = record.CGC ? record.CGC.toString().trim() : "";
      if (cgc && !seenCgcs.has(cgc)) {
        seenCgcs.add(cgc);
        uniqueRecords.push(record);
      }
    }

    console.log(
      `ℹ️ ${uniqueRecords.length} registros únicos após remoção de duplicatas.`
    );

    const processedData = uniqueRecords.map((record) => [
      record.CGC.toString().trim(),
      record.RAZAOSOCIAL ? record.RAZAOSOCIAL.toString().trim() : null,
      record.NOMEFANTASIA ? record.NOMEFANTASIA.toString().trim() : null,
      record.NUMEROEND ? record.NUMEROEND.toString().trim() : null,
      record.EMAIL ? record.EMAIL.toString().trim() : null,
      record.CEP ? record.CEP.toString().trim() : null,
      record.RUA ? record.RUA.toString().trim() : null,
      record.BAIRRO ? record.BAIRRO.toString().trim() : null,
      record.IDCIDADEESTADO || null,
      record.NUMEROCEL ? record.NUMEROCEL.toString().trim() : null,
    ]);

    const batchProcessor = async (batch) => {
      const result = await insertBatchPostgres(
        postgresPool,
        "clifornec",
        [
          "cgc",
          "razaosocial",
          "nomefantasia",
          "numeroend",
          "email",
          "cep",
          "rua",
          "bairro",
          "idcidadeestado",
          "numerocel",
        ],
        batch,
        `ON CONFLICT (cgc) DO UPDATE SET
         razaosocial = EXCLUDED.razaosocial,
         nomefantasia = EXCLUDED.nomefantasia,
         numeroend = EXCLUDED.numeroend,
         email = EXCLUDED.email,
         cep = EXCLUDED.cep,
         rua = EXCLUDED.rua,
         bairro = EXCLUDED.bairro,
         idcidadeestado = EXCLUDED.idcidadeestado,
         numerocel = EXCLUDED.numerocel`
      );
      console.log(
        `✅ Lote de clientes/fornecedores inserido: ${result.success} sucessos, ${result.errors} erros`
      );
      return [result];
    };

    const results = await processBatch(
      processedData,
      batchProcessor,
      BATCH_SIZE
    );

    const totalSuccess = results.reduce((sum, r) => sum + (r.success || 0), 0);
    const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);

    console.log(
      `✅ Migração de clientes/fornecedores concluída: ${totalSuccess} migrados, ${totalErrors} erros`
    );
    return { success: totalSuccess, errors: totalErrors };
  } catch (error) {
    console.error(
      "❌ Erro durante migração otimizada de clientes/fornecedores:",
      error
    );
    throw error;
  }
}

// Migração de centro de custo (já estava funcionando)
async function migrateCentroCusto(firebirdPool, postgresPool) {
  console.log("🚀 Iniciando migração OTIMIZADA de Centro de Custo...");

  try {
    const fdbQuery =
      "SELECT c.codcentrocust AS ID, c.desccentrcust AS NOME FROM CENTROCUSTO c";
    const centrosCusto = await executeFirebirdQueryOptimized(
      firebirdPool,
      fdbQuery
    );

    if (centrosCusto.length === 0) {
      console.log(
        "🟡 Nenhum Centro de Custo encontrado no Firebird para migrar."
      );
      return { success: 0, errors: 0 };
    }

    console.log(
      `ℹ️ Encontrados ${centrosCusto.length} Centro de Custo para migrar.`
    );

    const processedData = centrosCusto.map((cc) => [cc.ID, cc.NOME]);

    const result = await insertBatchPostgres(
      postgresPool,
      "centrocusto",
      ["id", "nome"],
      processedData,
      "ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome"
    );

    console.log(
      `✅ Migração de centro de custo concluída: ${result.success} migrados, ${result.errors} erros`
    );
    return result;
  } catch (error) {
    console.error(
      "❌ Erro durante migração otimizada de centro de custo:",
      error
    );
    throw error;
  }
}

// Migração de plano de contas (já estava funcionando)
async function migratePlanoContas(firebirdPool, postgresPool) {
  console.log("🚀 Iniciando migração OTIMIZADA de Plano de Contas...");

  try {
    const fdbQuery =
      "SELECT p.codiconta, p.descconta, p.tipoconta FROM PLC p ORDER BY p.codiconta";
    const planoContas = await executeFirebirdQueryOptimized(
      firebirdPool,
      fdbQuery
    );

    if (planoContas.length === 0) {
      console.log(
        "🟡 Nenhum Plano de Contas encontrado no Firebird para migrar."
      );
      return { success: 0, errors: 0 };
    }

    console.log(
      `ℹ️ Encontrados ${planoContas.length} Plano de Contas para migrar.`
    );

    const processedData = planoContas
      .filter((plc) => plc.CODICONTA && plc.CODICONTA.toString().trim() !== "")
      .map((plc) => [
        plc.CODICONTA.toString().trim(),
        plc.DESCCONTA ? plc.DESCCONTA.toString().trim() : null,
        plc.TIPOCONTA ? parseInt(plc.TIPOCONTA) : null,
      ]);

    const batchProcessor = async (batch) => {
      const result = await insertBatchPostgres(
        postgresPool,
        "plc",
        ["codiconta", "descconta", "tipoconta"],
        batch,
        `ON CONFLICT (codiconta) DO UPDATE SET
         descconta = EXCLUDED.descconta,
         tipoconta = EXCLUDED.tipoconta`
      );
      console.log(
        `✅ Lote de plano de contas inserido: ${result.success} sucessos, ${result.errors} erros`
      );
      return [result];
    };

    const results = await processBatch(
      processedData,
      batchProcessor,
      BATCH_SIZE
    );

    const totalSuccess = results.reduce((sum, r) => sum + (r.success || 0), 0);
    const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);

    console.log(
      `✅ Migração de plano de contas concluída: ${totalSuccess} migrados, ${totalErrors} erros`
    );
    return { success: totalSuccess, errors: totalErrors };
  } catch (error) {
    console.error(
      "❌ Erro durante migração otimizada de plano de contas:",
      error
    );
    throw error;
  }
}

// Migração de tipo de pagamento (já estava funcionando)
async function migrateTipoPag(firebirdPool, postgresPool) {
  console.log("🚀 Iniciando migração OTIMIZADA de Tipo Pagamento...");

  try {
    const fdbQuery =
      "SELECT t.codicob, t.desccob FROM TIPOCOB t WHERE t.codicob IS NOT NULL AND t.desccob IS NOT NULL";
    const tiposPagamento = await executeFirebirdQueryOptimized(
      firebirdPool,
      fdbQuery
    );

    if (tiposPagamento.length === 0) {
      console.log(
        "🟡 Nenhum Tipo Pagamento encontrado no Firebird para migrar."
      );
      return { success: 0, errors: 0 };
    }

    console.log(
      `ℹ️ Encontrados ${tiposPagamento.length} Tipo Pagamento para migrar.`
    );

    // Filtrar registros válidos e mapear corretamente
    const processedData = tiposPagamento
      .filter((tp) => tp.CODICOB != null && tp.DESCCOB != null)
      .map((tp) => {
        console.log(`📝 Processando: ID=${tp.CODICOB}, Nome=${tp.DESCCOB}`);
        return [
          parseInt(tp.CODICOB), // Garantir que é número
          tp.DESCCOB.toString().trim(), // Garantir que é string
        ];
      });

    console.log(`📊 ${processedData.length} registros válidos processados`);

    if (processedData.length === 0) {
      console.log("🟡 Nenhum registro válido para inserir.");
      return { success: 0, errors: 0 };
    }

    const result = await insertBatchPostgres(
      postgresPool,
      "tipopag",
      ["id", "nome"],
      processedData,
      "ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome"
    );

    console.log(
      `✅ Migração de tipo de pagamento concluída: ${result.success} migrados, ${result.errors} erros`
    );
    return result;
  } catch (error) {
    console.error(
      "❌ Erro durante migração otimizada de tipo de pagamento:",
      error
    );
    throw error;
  }
}

module.exports = {
  migrateUsers,
  migrateCidadeEstado,
  migrateCliFornec,
  migrateCentroCusto,
  migratePlanoContas,
  migrateTipoPag,
  BATCH_SIZE,
  CONCURRENT_OPERATIONS,
};
