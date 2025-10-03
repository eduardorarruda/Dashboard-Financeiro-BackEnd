require("dotenv").config();

const app = require("./src/app");
const config = require("./src/config/env");
const { pool } = require("./src/config/database");
// Importe a classe Database do seu módulo de migração
const { Database } = require("./migration/migrationDatabase");

const PORT = config.port;

// Função para iniciar o servidor e testar as conexões
const startServer = async () => {
  // Inicializar servidor
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Ambiente: ${config.nodeEnv}`);
    console.log(`📱 Acesse: http://localhost:${PORT}/api/health`);
  });

  // Testar as conexões com os bancos de dados
  console.log("\n🔄 Verificando conexão com os bancos de dados...");
  try {
    await Database.testConnections();
  } catch (error) {
    console.error("❌ Falha ao verificar as conexões durante a inicialização.");
  }

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
};

// Iniciar o processo
startServer();

// Tratamento de erros não capturados
process.on("uncaughtException", (error) => {
  console.error("❌ Erro não capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise rejeitada não tratada:", reason);
  process.exit(1);
});
