/*require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Database } = require("./database");
const { MigrationMain } = require("./migration/migrationService.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota para login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios",
      });
    }

    const loginResult = await Database.verifyLogin(email, password);

    if (loginResult.success) {
      res.json({
        success: true,
        message: "Login realizado com sucesso",
        user: loginResult.user,
      });
    } else {
      res.status(401).json({
        success: false,
        message: loginResult.message,
      });
    }
  } catch (error) {
    console.error("❌ Erro no endpoint de login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// Rota para cadastro usuario
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e senha são obrigatórios",
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido",
      });
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Senha deve ter pelo menos 6 caracteres",
      });
    }

    const createResult = await Database.createUser(name, email, password);

    if (createResult.success) {
      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        user: createResult.user,
      });
    } else {
      res.status(400).json({
        success: false,
        message: createResult.message,
      });
    }
  } catch (error) {
    console.error("❌ Erro no endpoint de cadastro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// Rota para listar usuários
app.get("/api/users", async (req, res) => {
  try {
    const usersResult = await Database.getAllUsers();

    if (usersResult.success) {
      res.json({
        success: true,
        users: usersResult.users,
      });
    } else {
      res.status(500).json({
        success: false,
        message: usersResult.message,
      });
    }
  } catch (error) {
    console.error("❌ Erro no endpoint de listagem:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// Rota para buscar os parceiros
app.get("/api/partners", async (req, res) => {
  try {
    const result = await Database.getAllPartners();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota para listar de tipos de pagamentos
app.get("/api/tipo-pagamento", async (req, res) => {
  try {
    const result = await Database.getTipopag();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota para listar movimentações financeiras
app.get("/api/financeiro-records", async (req, res) => {
  try {
    const result = await Database.getAllFinancialRecords();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota para CRIAR uma nova movimentação
app.post("/api/financeiro-records-post", async (req, res) => {
  try {
    const data = req.body;
    const result = await Database.postFinancialRecords(data);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota para ATUALIZAR uma movimentação
app.put("/api/financeiro-records-edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await Database.updateFinancialRecords(id, data);
    if (result.success) {
      res.json(result);
    } else {
      res
        .status(result.message.includes("não encontrado") ? 404 : 400)
        .json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota para DELETAR uma movimentação
app.delete("/api/financeiro-records-delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Database.deleteFinancialRecords(id);
    if (result.success) {
      res.json(result);
    } else {
      res
        .status(result.message.includes("não encontrado") ? 404 : 400)
        .json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota para fazer ou desfazer pagamento
app.put("/api/pagemento/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Database.finceiroPago(id, req.body);
    if (result.success) {
      res.json(result);
    } else {
      res
        .status(result.message.includes("não encontrado") ? 404 : 400)
        .json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota para buscar cidade e estado
app.get("/api/cidadeEstado", async (req, res) => {
  try {
    const result = await Database.getCidadeEstado();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota para criar um novo parceiro
app.post("/api/partners", async (req, res) => {
  try {
    const partnerData = req.body;
    const result = await Database.createPartner(partnerData);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

// Rota para busca parceiro
app.get("/api/getPartners/:cgc", async (req, res) => {
  try {
    const { cgc } = req.params;
    const result = await Database.getPartner(cgc);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

// Rota para deletar parceiro
app.delete("/api/partners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = parseInt(id, 10);
    if (isNaN(partnerId)) {
      return res.status(400).json({ success: false, message: "ID inválido." });
    }

    const result = await Database.deletePartner(partnerId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("❌ Erro no endpoint de exclusão de parceiro:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

// Rota para atualizar parceiro
app.put("/api/partners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const partnerData = req.body;
    const result = await Database.updatePartner(parseInt(id), partnerData);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

//Rota para Migração
app.post("/api/migration/execute", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({
      success: false,
      message:
        "Esta operação é permitida apenas em ambiente de desenvolvimento.",
    });
  }

  const { migrationType } = req.body;

  console.log(`📥 Recebida solicitação de migração: ${migrationType}`);

  try {
    let result;

    // Validate migration type
    const validMigrationTypes = [
      "complete",
      "users",
      "cidadeEstado",
      "cliFornec",
      "centroCusto",
      "planoContas",
      "tipoPag",
    ];

    if (!migrationType || !validMigrationTypes.includes(migrationType)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de migração inválido. Tipos válidos: ${validMigrationTypes.join(
          ", "
        )}`,
      });
    }

    console.log(`🚀 Iniciando migração do tipo: ${migrationType}`);

    switch (migrationType) {
      case "complete":
        result = await MigrationMain.executeMigration();
        break;
      case "users":
        result = await MigrationMain.executeUserMigration();
        break;
      case "cidadeEstado":
        result = await MigrationMain.executeCidadeEstadoMigration();
        break;
      case "cliFornec":
        result = await MigrationMain.executeCliFornecMigration();
        break;
      case "centroCusto":
        result = await MigrationMain.executeCentroCustoMigration();
        break;
      case "planoContas":
        result = await MigrationMain.executePlanoContasMigration();
        break;
      case "tipoPag":
        result = await MigrationMain.executeTipoPagMigration();
        break;
      default:
        throw new Error("Tipo de migração inválido");
    }

    console.log(
      `✅ Migração ${migrationType} finalizada:`,
      result.success ? "SUCESSO" : "ERRO"
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error(`❌ Erro crítico na migração ${migrationType}:`, error);

    res.status(500).json({
      success: false,
      message: `Erro durante a migração: ${error.message}`,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
});

//teste migração
app.get("/api/migration/test", async (req, res) => {
  try {
    const { Database } = require("./migration/migrationDatabase");
    const testResult = await Database.testConnections();
    res.json({
      success: true,
      message: "Migration database connections working",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Migration connection test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
});
// Rota para verificar saúde da API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando corretamente",
    timestamp: new Date().toISOString(),
  });
});

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// Middleware para tratamento de erros
app.use((error, req, res, next) => {
  console.error("❌ Erro não tratado:", error);
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
  console.log("🔄 Encerrando servidor...");
  await Database.closeConnections();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🔄 Encerrando servidor...");
  await Database.closeConnections();
  process.exit(0);
});

module.exports = app;
*/

require("dotenv").config();

const app = require("./src/app");
const config = require("./src/config/env");
const { pool } = require("./src/config/database");

const PORT = config.port;

// Inicializar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${config.nodeEnv}`);
  console.log(`📱 Acesse: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`🔄 Recebido sinal ${signal}, encerrando servidor...`);

  server.close(async () => {
    console.log("📡 Servidor HTTP fechado");

    try {
      await pool.end();
      console.log("🔒 Conexões com banco encerradas");
      process.exit(0);
    } catch (error) {
      console.error("❌ Erro ao fechar conexões:", error);
      process.exit(1);
    }
  });

  // Força o encerramento após 10 segundos
  setTimeout(() => {
    console.error("❌ Forçando encerramento do servidor");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Tratamento de erros não capturados
process.on("uncaughtException", (error) => {
  console.error("❌ Erro não capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise rejeitada não tratada:", reason);
  process.exit(1);
});

module.exports = server;
