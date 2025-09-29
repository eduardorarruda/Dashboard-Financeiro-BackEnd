const { firebirdPool, postgresPool } = require("./migrationDatabase");
const UserModel = require("./migration");

class MigrationController {
  static async startMigration() {
    try {
      console.log("Controlador: iniciando migração completa...");

      if (!firebirdPool || !postgresPool) {
        throw new Error("Pools de conexão não estão disponíveis");
      }

      // Test connections first
      await this._testConnections();

      const results = {};
      const failedMigrations = [];

      try {
        console.log("Iniciando migração de Cidade/Estado...");
        results.cidadeEstado = await this.migrateCidadeEstadoOnly();
      } catch (error) {
        console.error("Erro na migração cidadeEstado:", error);
        failedMigrations.push({
          migration: "cidadeEstado",
          error: error.message,
        });
        results.cidadeEstado = { success: false, error: error.message };
      }

      try {
        console.log("Iniciando migração de Usuários...");
        results.users = await this.migrateUsersOnly();
      } catch (error) {
        console.error("Erro na migração users:", error);
        failedMigrations.push({ migration: "users", error: error.message });
        results.users = { success: false, error: error.message };
      }

      try {
        console.log("Iniciando migração de Cliente/Fornecedor...");
        results.cliFornec = await this.migrateCliFornecOnly();
      } catch (error) {
        console.error("Erro na migração cliFornec:", error);
        failedMigrations.push({ migration: "cliFornec", error: error.message });
        results.cliFornec = { success: false, error: error.message };
      }

      try {
        console.log("Iniciando migração de Centro de Custo...");
        results.centroCusto = await this.migrateCentroCustoOnly();
      } catch (error) {
        console.error("Erro na migração centroCusto:", error);
        failedMigrations.push({
          migration: "centroCusto",
          error: error.message,
        });
        results.centroCusto = { success: false, error: error.message };
      }

      try {
        console.log("Iniciando migração de Plano de Contas...");
        results.planoContas = await this.migratePlanoContasOnly();
      } catch (error) {
        console.error("Erro na migração planoContas:", error);
        failedMigrations.push({
          migration: "planoContas",
          error: error.message,
        });
        results.planoContas = { success: false, error: error.message };
      }

      try {
        console.log("Iniciando migração de Tipo de Pagamento...");
        results.tipoPag = await this.migrateTipoPagOnly();
      } catch (error) {
        console.error("Erro na migração tipoPag:", error);
        failedMigrations.push({ migration: "tipoPag", error: error.message });
        results.tipoPag = { success: false, error: error.message };
      }

      if (failedMigrations.length > 0) {
        console.error("Algumas migrações falharam:", failedMigrations);
        return {
          success: false,
          error: "Algumas migrações falharam",
          failedMigrations,
          results,
        };
      }

      console.log("Migração completa finalizada com sucesso");
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error("Erro na migração completa:", error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  static async _testConnections() {
    try {
      // Test PostgreSQL connection
      const pgClient = await postgresPool.connect();
      pgClient.release();
      console.log("✅ Conexão PostgreSQL OK");

      // Test Firebird connection
      await new Promise((resolve, reject) => {
        firebirdPool.get((err, db) => {
          if (err) {
            console.error("❌ Erro conexão Firebird:", err);
            return reject(err);
          }
          console.log("✅ Conexão Firebird OK");
          db.detach();
          resolve();
        });
      });
    } catch (error) {
      console.error("❌ Erro ao testar conexões:", error);
      throw new Error(`Falha na conexão com banco de dados: ${error.message}`);
    }
  }

  static async migrateUsersOnly() {
    console.log("Controlador: migrando apenas usuários...");
    try {
      this._validateMigrationMethod("migrateUsers");

      await UserModel.migrateUsers(firebirdPool, postgresPool);
      console.log("Migração de usuários concluída");

      return {
        success: true,
        data: { message: "Usuários migrados com sucesso" },
      };
    } catch (error) {
      console.error("Erro na migração de usuários:", error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  static async migrateCidadeEstadoOnly() {
    console.log("Controlador: migrando apenas Cidade e Estado...");
    try {
      this._validateMigrationMethod("migrateCidadeEstado");

      await UserModel.migrateCidadeEstado(firebirdPool, postgresPool);
      console.log("Migração de cidades/estados concluída");

      return {
        success: true,
        data: { message: "Cidades/Estados migrados com sucesso" },
      };
    } catch (error) {
      console.error("Erro na migração de cidade/estado:", error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  static async migrateCliFornecOnly() {
    console.log("Controlador: migrando apenas Cliente/Fornecedor...");
    try {
      this._validateMigrationMethod("migrateCliFornec");

      await UserModel.migrateCliFornec(firebirdPool, postgresPool);
      console.log("Migração de clientes/fornecedores concluída");

      return {
        success: true,
        data: { message: "Clientes/Fornecedores migrados com sucesso" },
      };
    } catch (error) {
      console.error("Erro na migração de cliente/fornecedor:", error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  static async migrateCentroCustoOnly() {
    console.log("Controlador: migrando apenas Centro de Custo...");
    try {
      this._validateMigrationMethod("migrateCentroCusto");

      await UserModel.migrateCentroCusto(firebirdPool, postgresPool);
      console.log("Migração de centros de custo concluída");

      return {
        success: true,
        data: { message: "Centros de Custo migrados com sucesso" },
      };
    } catch (error) {
      console.error("Erro na migração de centro de custo:", error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  static async migratePlanoContasOnly() {
    console.log("Controlador: migrando apenas Plano de Contas...");
    try {
      this._validateMigrationMethod("migratePlanoContas");

      await UserModel.migratePlanoContas(firebirdPool, postgresPool);
      console.log("Migração de plano de contas concluída");

      return {
        success: true,
        data: { message: "Plano de Contas migrado com sucesso" },
      };
    } catch (error) {
      console.error("Erro na migração de plano de contas:", error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  static async migrateTipoPagOnly() {
    console.log("Controlador: migrando apenas Tipo pagamento...");
    try {
      this._validateMigrationMethod("migrateTipoPag");

      await UserModel.migrateTipoPag(firebirdPool, postgresPool);
      console.log("Migração de tipos de pagamento concluída");

      return {
        success: true,
        data: { message: "Tipos de Pagamento migrados com sucesso" },
      };
    } catch (error) {
      console.error("Erro na migração de tipo de pagamento:", error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  static _validateMigrationMethod(methodName) {
    if (!UserModel || typeof UserModel[methodName] !== "function") {
      throw new Error(`Método ${methodName} não encontrado no UserModel`);
    }
  }

  static async getMigrationStats() {
    try {
      console.log("Buscando estatísticas das migrações...");

      return {
        success: true,
        message: "Método getMigrationStats deve ser implementado",
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = { MigrationController };
