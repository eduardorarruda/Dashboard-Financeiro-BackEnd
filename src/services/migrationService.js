const { AppError } = require("../utils/errors");

class MigrationService {
  constructor() {
    this.firebirdPool = null;
    this.postgresPool = null;
    this.migrationFunctions = null;
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

    // CORREÇÃO: Importar as funções de migração diretamente
    if (!this.migrationFunctions) {
      this.migrationFunctions = require("../../migration/migration");
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
        message: "Todas as conexões estão funcionando",
      };
    } catch (error) {
      console.error("❌ Erro ao testar conexões:", error);
      throw new AppError(`Falha na conexão: ${error.message}`, 500);
    }
  }

  async executeCompleteMigration() {
    try {
      await this._initializePools();

      console.log("🚀 Iniciando migração completa...");

      const results = {};
      const failedMigrations = [];
      let totalSuccess = 0;
      let totalErrors = 0;

      // Ordem de migração (com dependências)
      const migrations = [
        {
          name: "cidadeEstado",
          fn: "migrateCidadeEstado",
          label: "Cidades/Estados",
        },
        { name: "users", fn: "migrateUsers", label: "Usuários" },
        {
          name: "cliFornec",
          fn: "migrateCliFornec",
          label: "Clientes/Fornecedores",
        },
        {
          name: "centroCusto",
          fn: "migrateCentroCusto",
          label: "Centros de Custo",
        },
        {
          name: "planoContas",
          fn: "migratePlanoContas",
          label: "Plano de Contas",
        },
        { name: "tipoPag", fn: "migrateTipoPag", label: "Tipos de Pagamento" },
        { name: "financeiro", fn: "migrateFinanceiro", label: "Financeiro" },
      ];

      for (const migration of migrations) {
        try {
          console.log(`\n📦 Iniciando migração de ${migration.label}...`);

          const result = await this.migrationFunctions[migration.fn](
            this.firebirdPool,
            this.postgresPool
          );

          results[migration.name] = {
            success: true,
            successCount: result.success || 0,
            errorCount: result.errors || 0,
            warnings: result.warnings || null,
          };

          totalSuccess += result.success || 0;
          totalErrors += result.errors || 0;

          console.log(
            `✅ ${migration.label}: ${result.success} registros migrados`
          );
        } catch (error) {
          console.error(`❌ Erro na migração ${migration.label}:`, error);
          failedMigrations.push({
            migration: migration.name,
            error: error.message,
          });
          results[migration.name] = {
            success: false,
            error: error.message,
          };
        }
      }

      if (failedMigrations.length > 0) {
        return {
          success: false,
          data: results,
          error: "Algumas migrações falharam",
          failedMigrations,
          summary: {
            totalSuccess,
            totalErrors,
            failed: failedMigrations.length,
          },
        };
      }

      return {
        success: true,
        data: results,
        message: "Migração completa executada com sucesso",
        summary: {
          totalSuccess,
          totalErrors,
          failed: 0,
        },
      };
    } catch (error) {
      console.error("❌ Erro na migração completa:", error);
      throw new AppError(`Erro na migração completa: ${error.message}`, 500);
    }
  }

  async migrateUsers() {
    try {
      await this._initializePools();

      console.log("👥 Iniciando migração de usuários...");
      const result = await this.migrationFunctions.migrateUsers(
        this.firebirdPool,
        this.postgresPool
      );

      return {
        success: true,
        data: {
          message: "Usuários migrados com sucesso",
          successCount: result.success || 0,
          errorCount: result.errors || 0,
        },
      };
    } catch (error) {
      console.error("❌ Erro na migração de usuários:", error);
      throw new AppError(`Erro na migração de usuários: ${error.message}`, 500);
    }
  }

  async migrateCidadeEstado() {
    try {
      await this._initializePools();

      console.log("🏙️ Iniciando migração de cidades e estados...");
      const result = await this.migrationFunctions.migrateCidadeEstado(
        this.firebirdPool,
        this.postgresPool
      );

      return {
        success: true,
        data: {
          message: "Cidades/Estados migrados com sucesso",
          successCount: result.success || 0,
          errorCount: result.errors || 0,
        },
      };
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

      console.log("🏢 Iniciando migração de clientes e fornecedores...");
      const result = await this.migrationFunctions.migrateCliFornec(
        this.firebirdPool,
        this.postgresPool
      );

      return {
        success: true,
        data: {
          message: "Clientes/Fornecedores migrados com sucesso",
          successCount: result.success || 0,
          errorCount: result.errors || 0,
        },
      };
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

      console.log("💰 Iniciando migração de centros de custo...");
      const result = await this.migrationFunctions.migrateCentroCusto(
        this.firebirdPool,
        this.postgresPool
      );

      return {
        success: true,
        data: {
          message: "Centros de Custo migrados com sucesso",
          successCount: result.success || 0,
          errorCount: result.errors || 0,
        },
      };
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

      console.log("📋 Iniciando migração de plano de contas...");
      const result = await this.migrationFunctions.migratePlanoContas(
        this.firebirdPool,
        this.postgresPool
      );

      return {
        success: true,
        data: {
          message: "Plano de Contas migrado com sucesso",
          successCount: result.success || 0,
          errorCount: result.errors || 0,
        },
      };
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

      console.log("💳 Iniciando migração de tipos de pagamento...");
      const result = await this.migrationFunctions.migrateTipoPag(
        this.firebirdPool,
        this.postgresPool
      );

      return {
        success: true,
        data: {
          message: "Tipos de Pagamento migrados com sucesso",
          successCount: result.success || 0,
          errorCount: result.errors || 0,
        },
      };
    } catch (error) {
      console.error("❌ Erro na migração de tipos de pagamento:", error);
      throw new AppError(
        `Erro na migração de tipos de pagamento: ${error.message}`,
        500
      );
    }
  }

  async migrateFinanceiro() {
    try {
      await this._initializePools();

      console.log("💸 Iniciando migração do Financeiro...");
      const result = await this.migrationFunctions.migrateFinanceiro(
        this.firebirdPool,
        this.postgresPool
      );

      // CORREÇÃO: Incluir warnings na resposta
      const response = {
        success: true,
        data: {
          message: "Financeiro migrado com sucesso",
          successCount: result.success || 0,
          errorCount: result.errors || 0,
        },
      };

      // Adicionar warnings se existirem
      if (result.warnings) {
        response.data.warnings = result.warnings;

        const totalWarnings = Object.values(result.warnings).reduce(
          (sum, count) => sum + count,
          0
        );
        if (totalWarnings > 0) {
          response.data.message += ` (${totalWarnings} registros com avisos)`;
        }
      }

      return response;
    } catch (error) {
      console.error("❌ Erro na migração do Financeiro:", error);
      throw new AppError(
        `Erro na migração do Financeiro: ${error.message}`,
        500
      );
    }
  }
}

module.exports = MigrationService;
