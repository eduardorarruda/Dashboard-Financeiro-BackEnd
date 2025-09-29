const { AppError } = require("../utils/errors");

class MigrationService {
  constructor() {
    // Pool de conexões será importado quando necessário
    this.firebirdPool = null;
    this.postgresPool = null;
  }

  async _initializePools() {
    if (!this.firebirdPool || !this.postgresPool) {
      const {
        firebirdPool,
        postgresPool,
      } = require("../../migration/migrationDatabase");
      this.firebirdPool = firebirdPool;
      this.postgresPool = postgresPool;
    }
  }

  async testConnections() {
    try {
      await this._initializePools();

      // Test PostgreSQL
      const pgClient = await this.postgresPool.connect();
      pgClient.release();
      console.log("✅ Conexão PostgreSQL OK");

      // Test Firebird
      await new Promise((resolve, reject) => {
        this.firebirdPool.get((err, db) => {
          if (err) {
            console.error("❌ Erro conexão Firebird:", err);
            return reject(err);
          }
          console.log("✅ Conexão Firebird OK");
          db.detach();
          resolve();
        });
      });

      return {
        postgres: true,
        firebird: true,
      };
    } catch (error) {
      console.error("❌ Erro ao testar conexões:", error);
      throw new AppError(`Falha na conexão: ${error.message}`, 500);
    }
  }

  async executeCompleteMigration() {
    try {
      await this._initializePools();
      const {
        MigrationController,
      } = require("../../migration/migrationController");

      console.log("🚀 Iniciando migração completa...");
      const result = await MigrationController.startMigration();

      return result;
    } catch (error) {
      console.error("❌ Erro na migração completa:", error);
      throw new AppError(`Erro na migração completa: ${error.message}`, 500);
    }
  }

  async migrateUsers() {
    try {
      await this._initializePools();
      const {
        MigrationController,
      } = require("../../migration/migrationController");

      console.log("👥 Iniciando migração de usuários...");
      const result = await MigrationController.migrateUsersOnly();

      return result;
    } catch (error) {
      console.error("❌ Erro na migração de usuários:", error);
      throw new AppError(`Erro na migração de usuários: ${error.message}`, 500);
    }
  }

  async migrateCidadeEstado() {
    try {
      await this._initializePools();
      const {
        MigrationController,
      } = require("../../migration/migrationController");

      console.log("🏙️ Iniciando migração de cidades e estados...");
      const result = await MigrationController.migrateCidadeEstadoOnly();

      return result;
    } catch (error) {
      console.error("❌ Erro na migração de cidades e estados:", error);
      throw new AppError(
        `Erro na migração de cidades e estados: ${error.message}`,
        500
      );
    }
  }

  async migrateCliFornec() {
    try {
      await this._initializePools();
      const {
        MigrationController,
      } = require("../../migration/migrationController");

      console.log("🏢 Iniciando migração de clientes e fornecedores...");
      const result = await MigrationController.migrateCliFornecOnly();

      return result;
    } catch (error) {
      console.error("❌ Erro na migração de clientes e fornecedores:", error);
      throw new AppError(
        `Erro na migração de clientes e fornecedores: ${error.message}`,
        500
      );
    }
  }

  async migrateCentroCusto() {
    try {
      await this._initializePools();
      const {
        MigrationController,
      } = require("../../migration/migrationController");

      console.log("💰 Iniciando migração de centros de custo...");
      const result = await MigrationController.migrateCentroCustoOnly();

      return result;
    } catch (error) {
      console.error("❌ Erro na migração de centros de custo:", error);
      throw new AppError(
        `Erro na migração de centros de custo: ${error.message}`,
        500
      );
    }
  }

  async migratePlanoContas() {
    try {
      await this._initializePools();
      const {
        MigrationController,
      } = require("../../migration/migrationController");

      console.log("📋 Iniciando migração de plano de contas...");
      const result = await MigrationController.migratePlanoContasOnly();

      return result;
    } catch (error) {
      console.error("❌ Erro na migração de plano de contas:", error);
      throw new AppError(
        `Erro na migração de plano de contas: ${error.message}`,
        500
      );
    }
  }

  async migrateTipoPag() {
    try {
      await this._initializePools();
      const {
        MigrationController,
      } = require("../../migration/migrationController");

      console.log("💳 Iniciando migração de tipos de pagamento...");
      const result = await MigrationController.migrateTipoPagOnly();

      return result;
    } catch (error) {
      console.error("❌ Erro na migração de tipos de pagamento:", error);
      throw new AppError(
        `Erro na migração de tipos de pagamento: ${error.message}`,
        500
      );
    }
  }
}

module.exports = MigrationService;
