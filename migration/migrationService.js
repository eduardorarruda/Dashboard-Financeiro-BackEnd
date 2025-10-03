require("dotenv").config();
const { firebirdPool, postgresPool } = require("./migrationDatabase");
const {
  migrateUsers,
  migrateCidadeEstado,
  migrateCliFornec,
  migrateCentroCusto,
  migratePlanoContas,
  migrateTipoPag,
  migrateFinanceiro,
} = require("./migration");

class MigrationMain {
  static async executeMigration() {
    console.log("=".repeat(50));
    console.log("🚀 INICIANDO PROCESSO DE MIGRAÇÃO COMPLETA");
    console.log("=".repeat(50));

    try {
      const results = {};
      const failedMigrations = [];

      // Ordem correta de migração (respeitando dependências)
      const migrations = [
        {
          name: "cidadeEstado",
          fn: migrateCidadeEstado,
          label: "Cidades/Estados",
        },
        { name: "users", fn: migrateUsers, label: "Usuários" },
        {
          name: "cliFornec",
          fn: migrateCliFornec,
          label: "Clientes/Fornecedores",
        },
        {
          name: "centroCusto",
          fn: migrateCentroCusto,
          label: "Centros de Custo",
        },
        {
          name: "planoContas",
          fn: migratePlanoContas,
          label: "Plano de Contas",
        },
        { name: "tipoPag", fn: migrateTipoPag, label: "Tipos de Pagamento" },
        { name: "financeiro", fn: migrateFinanceiro, label: "Financeiro" },
      ];

      for (const migration of migrations) {
        try {
          console.log(`\n📦 Iniciando migração de ${migration.label}...`);

          const result = await migration.fn(firebirdPool, postgresPool);

          results[migration.name] = {
            successCount: result.success || 0,
            errorCount: result.errors || 0,
            warnings: result.warnings || null,
          };

          console.log(
            `✅ ${migration.label}: ${result.success || 0} migrados, ${
              result.errors || 0
            } erros`
          );

          // Exibir warnings se existirem
          if (result.warnings) {
            const totalWarnings = Object.values(result.warnings).reduce(
              (sum, count) => sum + count,
              0
            );
            if (totalWarnings > 0) {
              console.log(`⚠️  ${totalWarnings} avisos encontrados:`);
              Object.entries(result.warnings).forEach(([key, count]) => {
                if (count > 0) {
                  console.log(`   - ${key}: ${count}`);
                }
              });
            }
          }
        } catch (error) {
          console.error(
            `❌ Erro na migração ${migration.label}:`,
            error.message
          );
          failedMigrations.push({
            migration: migration.name,
            error: error.message,
          });
          results[migration.name] = {
            successCount: 0,
            errorCount: 0,
            error: error.message,
          };
        }
      }

      if (failedMigrations.length > 0) {
        console.log("\n" + "=".repeat(50));
        console.log("⚠️  MIGRAÇÃO COMPLETA COM FALHAS PARCIAIS");
        console.log("=".repeat(50));
        console.log("\n🔍 MIGRAÇÕES QUE FALHARAM:");
        failedMigrations.forEach((failed) => {
          console.log(`   - ${failed.migration}: ${failed.error}`);
        });
        console.log("\n📊 RESUMO FINAL DE TODAS AS MIGRAÇÕES:");
        this._printSummary(results);

        return {
          success: false,
          data: results,
          error: "Algumas migrações falharam",
          failedMigrations,
        };
      }

      console.log("\n" + "=".repeat(50));
      console.log("✅ MIGRAÇÃO COMPLETA CONCLUÍDA COM SUCESSO!");
      console.log("=".repeat(50));
      console.log("\n📊 RESUMO FINAL DE TODAS AS MIGRAÇÕES:");
      this._printSummary(results);

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.log("\n" + "=".repeat(50));
      console.log("💥 ERRO CRÍTICO NA MIGRAÇÃO COMPLETA!");
      console.log("=".repeat(50));
      console.error("Erro:", error);

      return {
        success: false,
        message: "Erro crítico durante a migração completa",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  static _printSummary(results) {
    console.log(
      `🏙️  Cidades/Estados: ${
        results.cidadeEstado?.successCount || 0
      } migrados, ${results.cidadeEstado?.errorCount || 0} erros`
    );
    console.log(
      `👥 Usuários: ${results.users?.successCount || 0} migrados, ${
        results.users?.errorCount || 0
      } erros`
    );
    console.log(
      `🏢 Clientes/Fornecedores: ${
        results.cliFornec?.successCount || 0
      } migrados, ${results.cliFornec?.errorCount || 0} erros`
    );
    console.log(
      `💰 Centros de Custo: ${
        results.centroCusto?.successCount || 0
      } migrados, ${results.centroCusto?.errorCount || 0} erros`
    );
    console.log(
      `📋 Plano de Contas: ${
        results.planoContas?.successCount || 0
      } migrados, ${results.planoContas?.errorCount || 0} erros`
    );
    console.log(
      `💳 Tipos de Pagamento: ${results.tipoPag?.successCount || 0} migrados, ${
        results.tipoPag?.errorCount || 0
      } erros`
    );
    console.log(
      `💸 Financeiro: ${results.financeiro?.successCount || 0} migrados, ${
        results.financeiro?.errorCount || 0
      } erros`
    );
  }

  static async executeUserMigration() {
    console.log("👥 Executando migração de usuários...");

    try {
      const result = await migrateUsers(firebirdPool, postgresPool);
      console.log(
        result.success > 0
          ? `✅ Usuários migrados! ${result.success} sucessos, ${result.errors} erros`
          : "❌ Erro na migração de usuários"
      );
      return {
        success: result.success > 0,
        data: result,
      };
    } catch (error) {
      console.error("💥 Erro crítico na migração de usuários:", error);
      return {
        success: false,
        message: "Erro crítico na migração de usuários",
        error: error.message,
      };
    }
  }

  static async executeCidadeEstadoMigration() {
    console.log("🏙️ Executando migração de cidades e estados...");

    try {
      const result = await migrateCidadeEstado(firebirdPool, postgresPool);
      console.log(
        result.success > 0
          ? `✅ Cidades e estados migrados! ${result.success} sucessos, ${result.errors} erros`
          : "❌ Erro na migração de cidades e estados"
      );
      return {
        success: result.success > 0,
        data: result,
      };
    } catch (error) {
      console.error("💥 Erro crítico na migração de cidades e estados:", error);
      return {
        success: false,
        message: "Erro crítico na migração de cidades e estados",
        error: error.message,
      };
    }
  }

  static async executeCliFornecMigration() {
    console.log("🏢 Executando migração de clientes e fornecedores...");

    try {
      const result = await migrateCliFornec(firebirdPool, postgresPool);
      console.log(
        result.success > 0
          ? `✅ Clientes e fornecedores migrados! ${result.success} sucessos, ${result.errors} erros`
          : "❌ Erro na migração de clientes e fornecedores"
      );
      return {
        success: result.success > 0,
        data: result,
      };
    } catch (error) {
      console.error(
        "💥 Erro crítico na migração de clientes e fornecedores:",
        error
      );
      return {
        success: false,
        message: "Erro crítico na migração de clientes e fornecedores",
        error: error.message,
      };
    }
  }

  static async executeCentroCustoMigration() {
    console.log("💰 Executando migração de centros de custo...");

    try {
      const result = await migrateCentroCusto(firebirdPool, postgresPool);
      console.log(
        result.success > 0
          ? `✅ Centros de custo migrados! ${result.success} sucessos, ${result.errors} erros`
          : "❌ Erro na migração de centros de custo"
      );
      return {
        success: result.success > 0,
        data: result,
      };
    } catch (error) {
      console.error("💥 Erro crítico na migração de centros de custo:", error);
      return {
        success: false,
        message: "Erro crítico na migração de centros de custo",
        error: error.message,
      };
    }
  }

  static async executePlanoContasMigration() {
    console.log("📋 Executando migração de plano de contas...");

    try {
      const result = await migratePlanoContas(firebirdPool, postgresPool);
      console.log(
        result.success > 0
          ? `✅ Plano de contas migrado! ${result.success} sucessos, ${result.errors} erros`
          : "❌ Erro na migração de plano de contas"
      );
      return {
        success: result.success > 0,
        data: result,
      };
    } catch (error) {
      console.error("💥 Erro crítico na migração de plano de contas:", error);
      return {
        success: false,
        message: "Erro crítico na migração de plano de contas",
        error: error.message,
      };
    }
  }

  static async executeTipoPagMigration() {
    console.log("💳 Executando migração de tipos de pagamento...");

    try {
      const result = await migrateTipoPag(firebirdPool, postgresPool);
      console.log(
        result.success > 0
          ? `✅ Tipos de pagamento migrados! ${result.success} sucessos, ${result.errors} erros`
          : "❌ Erro na migração de tipos de pagamento"
      );
      return {
        success: result.success > 0,
        data: result,
      };
    } catch (error) {
      console.error(
        "💥 Erro crítico na migração de tipos de pagamento:",
        error
      );
      return {
        success: false,
        message: "Erro crítico na migração de tipos de pagamento",
        error: error.message,
      };
    }
  }

  static async executeFinanceiroMigration() {
    console.log("💸 Executando migração do Financeiro...");

    try {
      const result = await migrateFinanceiro(firebirdPool, postgresPool);

      // Exibir warnings se existirem
      if (result.warnings) {
        const totalWarnings = Object.values(result.warnings).reduce(
          (sum, count) => sum + count,
          0
        );
        if (totalWarnings > 0) {
          console.log(`\n⚠️  ${totalWarnings} avisos encontrados:`);
          Object.entries(result.warnings).forEach(([key, count]) => {
            if (count > 0) {
              const labels = {
                cgcNotFound: "CGCs não encontrados no PostgreSQL",
                invalidTipoPag:
                  "Tipos de pagamento inválidos (setados como NULL)",
                invalidTipo: "Tipos de documento inválidos",
                invalidSituacao: "Situações inválidas",
              };
              console.log(`   - ${labels[key] || key}: ${count}`);
            }
          });
        }
      }

      console.log(
        result.success > 0
          ? `✅ Financeiro migrado! ${result.success} sucessos, ${result.errors} erros`
          : "❌ Erro na migração do Financeiro"
      );

      return {
        success: result.success > 0,
        data: result,
      };
    } catch (error) {
      console.error("💥 Erro crítico na migração do Financeiro:", error);
      return {
        success: false,
        message: "Erro crítico na migração do Financeiro",
        error: error.message,
      };
    }
  }
}

// Funções globais para compatibilidade (uso no console Node.js)
global.startMigration = async () => {
  return await MigrationMain.executeMigration();
};

global.startUserMigration = async () => {
  return await MigrationMain.executeUserMigration();
};

global.startCidadeEstadoMigration = async () => {
  return await MigrationMain.executeCidadeEstadoMigration();
};

global.startCliFornecMigration = async () => {
  return await MigrationMain.executeCliFornecMigration();
};

global.startCentroCustoMigration = async () => {
  return await MigrationMain.executeCentroCustoMigration();
};

global.startPlanoContasMigration = async () => {
  return await MigrationMain.executePlanoContasMigration();
};

global.startTipoPagMigration = async () => {
  return await MigrationMain.executeTipoPagMigration();
};

global.startFinanceiroMigration = async () => {
  return await MigrationMain.executeFinanceiroMigration();
};

module.exports = {
  MigrationMain,
  startMigration: MigrationMain.executeMigration,
  startUserMigration: MigrationMain.executeUserMigration,
  startCidadeEstadoMigration: MigrationMain.executeCidadeEstadoMigration,
  startCliFornecMigration: MigrationMain.executeCliFornecMigration,
  startCentroCustoMigration: MigrationMain.executeCentroCustoMigration,
  startPlanoContasMigration: MigrationMain.executePlanoContasMigration,
  startTipoPagMigration: MigrationMain.executeTipoPagMigration,
  startFinanceiroMigration: MigrationMain.executeFinanceiroMigration,
};
