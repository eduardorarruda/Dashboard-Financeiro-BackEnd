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

// Configuração do banco PostgreSQL
const dbConfigPG = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const firebirdPool = Firebird.pool(5, dbConfigFDB);

const postgresPool = new Pool(dbConfigPG);

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
    try {
      const client = await postgresPool.connect();
      console.log("✅ Teste de conexão com PostgreSQL bem-sucedido");
      client.release();
      return true;
    } catch (error) {
      console.error("❌ Erro no teste de conexão com PostgreSQL:", error);
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
      console.error("❌ Erro ao testar conexões:", error);
      throw error;
    }
  }

  // Método para fechar todas as conexões
  static async closeConnections() {
    try {
      await firebirdPool.end();
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

// Inicialização automática
(async () => {
  try {
    await Database.testConnections();
    console.log("🚀 Database inicializado com sucesso");
  } catch (error) {
    console.error("❌ Erro na inicialização do database:", error);
  }
})();

module.exports = {
  Database,
  firebirdPool,
  postgresPool,
};
