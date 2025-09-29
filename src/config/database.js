const { Pool } = require("pg");
const config = require("./env");

const pool = new Pool(config.database);

pool.on("connect", () => {
  console.log("🔗 Conectado ao banco PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Erro na conexão com o banco:", err);
  process.exit(-1);
});

// Teste de conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Teste de conexão bem-sucedido");
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Erro no teste de conexão:", error);
    return false;
  }
};

// Inicialização
testConnection();

module.exports = { pool, testConnection };
