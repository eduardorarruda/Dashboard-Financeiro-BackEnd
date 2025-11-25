const MigrationService = require("../services/migrationService");
const ApiResponse = require("../utils/responses");
const config = require("../config/env");

class MigrationController {
  constructor() {
    this.migrationService = new MigrationService();
  }

  async executeMigration(req, res, next) {
    try {
      // Verificar se está em desenvolvimento
      if (config.nodeEnv !== "development") {
        return ApiResponse.forbidden(
          res,
          "Esta operação é permitida apenas em ambiente de desenvolvimento"
        );
      }

      const { migrationType } = req.body;

      if (!migrationType) {
        return ApiResponse.validationError(res, [
          "Tipo de migração é obrigatório",
        ]);
      }

      const validTypes = [
        "complete",
        "users",
        "cidadeEstado",
        "cliFornec",
        "centroCusto",
        "planoContas",
        "tipoPag",
        "financeiro",
      ];

      if (!validTypes.includes(migrationType)) {
        return ApiResponse.validationError(res, [
          `Tipo de migração inválido. Tipos válidos: ${validTypes.join(", ")}`,
        ]);
      }

      console.log(`🚀 Iniciando migração do tipo: ${migrationType}`);

      let result;

      switch (migrationType) {
        case "complete":
          result = await this.migrationService.executeCompleteMigration();
          break;
        case "users":
          result = await this.migrationService.migrateUsers();
          break;
        case "cidadeEstado":
          result = await this.migrationService.migrateCidadeEstado();
          break;
        case "cliFornec":
          result = await this.migrationService.migrateCliFornec();
          break;
        case "centroCusto":
          result = await this.migrationService.migrateCentroCusto();
          break;
        case "planoContas":
          result = await this.migrationService.migratePlanoContas();
          break;
        case "tipoPag":
          result = await this.migrationService.migrateTipoPag();
          break;
        case "financeiro":
          result = await this.migrationService.migrateFinanceiro();
          break;
      }

      console.log(
        `✅ Migração ${migrationType} finalizada:`,
        result.success ? "SUCESSO" : "ERRO"
      );

      if (result.success) {
        // CORREÇÃO: Melhorar formatação da resposta
        const responseData = {
          ...result.data,
          migrationType,
          timestamp: new Date().toISOString(),
        };

        // Para migração completa, adicionar resumo
        if (migrationType === "complete" && result.summary) {
          responseData.summary = result.summary;
        }

        // Se houver falhas parciais na migração completa
        if (result.failedMigrations && result.failedMigrations.length > 0) {
          return ApiResponse.error(
            res,
            "Migração completa com falhas parciais",
            207, // Multi-Status
            {
              ...responseData,
              failedMigrations: result.failedMigrations,
            }
          );
        }

        return ApiResponse.success(
          res,
          responseData,
          result.message || `Migração ${migrationType} executada com sucesso`
        );
      } else {
        return ApiResponse.error(
          res,
          result.error || result.message || "Erro na migração",
          500,
          {
            migrationType,
            details: result.data || null,
            failedMigrations: result.failedMigrations || null,
          }
        );
      }
    } catch (error) {
      console.error("❌ Erro na migração:", error);
      next(error);
    }
  }

  async testConnections(req, res, next) {
    try {
      const result = await this.migrationService.testConnections();
      return ApiResponse.success(res, result, "Conexões testadas com sucesso");
    } catch (error) {
      next(error);
    }
  }

  async getMigrationStats(req, res, next) {
    try {
      // TODO: Implementar busca real de estatísticas
      const stats = {
        lastMigration: null,
        totalRecordsMigrated: 0,
        migrations: {
          users: { total: 0, lastRun: null },
          cidadeEstado: { total: 0, lastRun: null },
          cliFornec: { total: 0, lastRun: null },
          centroCusto: { total: 0, lastRun: null },
          planoContas: { total: 0, lastRun: null },
          tipoPag: { total: 0, lastRun: null },
          financeiro: { total: 0, lastRun: null },
        },
        message: "Método em desenvolvimento - estatísticas mock",
      };

      return ApiResponse.success(res, stats, "Estatísticas de migração");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MigrationController;
