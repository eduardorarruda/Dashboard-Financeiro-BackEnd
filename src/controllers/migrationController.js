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
      }

      console.log(
        `✅ Migração ${migrationType} finalizada:`,
        result.success ? "SUCESSO" : "ERRO"
      );

      if (result.success) {
        return ApiResponse.success(
          res,
          result.data,
          `Migração ${migrationType} executada com sucesso`
        );
      } else {
        return ApiResponse.error(
          res,
          result.message || "Erro na migração",
          500
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
      // Implementar estatísticas se necessário
      return ApiResponse.success(
        res,
        { message: "Estatísticas de migração" },
        "Método em desenvolvimento"
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MigrationController;
