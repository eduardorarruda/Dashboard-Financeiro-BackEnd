require("dotenv").config();

const Firebird = require("node-firebird");
const { Pool } = require("pg");

// Configuração do banco Firebird
const dbConfigFDB = {
  host: process.env.FDB_HOST,
  port: process.env.FDB_PORT,
  database: process.env.FDB_DATABASE,
  user: process.env.FDB_USER,
  password: process.env.FDB_PASSWORD,
  lowercase_keys: false,
  role: null,
  pageSize: 4096,
};

// Configuração do banco PostgreSQL - AIVEN CLOUD
const dbConfigPG = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // SSL obrigatório para Aiven Cloud
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  // CRÍTICO: Aiven precisa de timeout maior (conexão na nuvem)
  connectionTimeoutMillis: 15000, // 15 segundos
  statement_timeout: 30000,
  // Adicionar configurações para estabilidade
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

console.log("📋 Configuração PostgreSQL (Aiven Cloud):");
console.log(`   Host: ${dbConfigPG.host}`);
console.log(`   Port: ${dbConfigPG.port}`);
console.log(`   Database: ${dbConfigPG.database}`);
console.log(`   User: ${dbConfigPG.user}`);
console.log(`   SSL: Obrigatório (Aiven)`);

const firebirdPool = Firebird.pool(5, dbConfigFDB);
const postgresPool = new Pool(dbConfigPG);

// Handler de erros do pool
postgresPool.on("error", (err) => {
  console.error("❌ Erro inesperado no pool PostgreSQL:", err.message);
});

// Classe para gerenciar operações do banco
class Database {
  // Método para testar a conexão com Firebird
  static testFirebirdConnection() {
    return new Promise((resolve, reject) => {
      firebirdPool.get((err, db) => {
        if (err) {
          console.error("❌ Erro no teste de conexão com Firebird:", err);
          return reject(err);
        }
        console.log("✅ Teste de conexão com Firebird bem-sucedido");
        db.detach();
        resolve(true);
      });
    });
  }

  // Método para testar a conexão com PostgreSQL
  static async testPostgresConnection() {
    let client;
    try {
      console.log("🔄 Conectando ao PostgreSQL (Aiven Cloud)...");
      client = await postgresPool.connect();

      // Testar com query simples
      const result = await client.query(
        "SELECT NOW() as now, version() as version"
      );
      console.log(`✅ PostgreSQL conectado! Timestamp: ${result.rows[0].now}`);

      client.release();
      return true;
    } catch (error) {
      if (client) client.release();

      console.error("❌ Erro ao conectar PostgreSQL:", error.message);

      // Mensagens de ajuda específicas
      if (error.message.includes("timeout")) {
        console.error("💡 Possíveis causas:");
        console.error("   - Verifique se o IP está na whitelist do Aiven");
        console.error("   - Firewall local bloqueando porta 18058");
        console.error("   - Conexão de internet instável");
      } else if (
        error.message.includes("password") ||
        error.message.includes("authentication")
      ) {
        console.error("💡 Verifique as credenciais no arquivo .env");
      }

      throw error;
    }
  }

  // Método para testar ambas as conexões
  static async testConnections() {
    try {
      await this.testFirebirdConnection();
      await this.testPostgresConnection();
      console.log("✅ Todas as conexões testadas com sucesso");
      return true;
    } catch (error) {
      console.error("❌ Erro ao testar conexões:", error.message);
      throw error;
    }
  }

  // Método para fechar todas as conexões
  static async closeConnections() {
    try {
      await postgresPool.end();
      console.log("🔒 Conexões com os bancos encerradas");
    } catch (error) {
      console.error("❌ Erro ao fechar conexões:", error);
    }
  }

  // Getter para o pool do Firebird
  static get firebirdPool() {
    return firebirdPool;
  }

  // Getter para o pool do PostgreSQL
  static get postgresPool() {
    return postgresPool;
  }
}

// Inicialização automática (não bloqueia o servidor se falhar)
(async () => {
  try {
    await Database.testConnections();
    console.log("🚀 Database inicializado com sucesso");
  } catch (error) {
    console.error("❌ Erro na inicialização do database:", error.message);
    console.warn("⚠️  Servidor continuará rodando, mas migrações podem falhar");
  }
})();

module.exports = {
  Database,
  firebirdPool,
  postgresPool,
};
