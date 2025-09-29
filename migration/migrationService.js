require("dotenv").config();
const { MigrationController } = require("./migrationController");

class MigrationMain {
  static async executeMigration() {
    console.log("=".repeat(50));
    console.log("🚀 INICIANDO PROCESSO DE MIGRAÇÃO COMPLETA");
    console.log("=".repeat(50));

    try {
      const result = await MigrationController.startMigration();

      if (result.success) {
        console.log("\n" + "=".repeat(50));
        console.log("✅ MIGRAÇÃO COMPLETA CONCLUÍDA COM SUCESSO!");
        console.log("=".repeat(50));

        if (result.data) {
          console.log("\n📊 RESUMO FINAL DE TODAS AS MIGRAÇÕES:");
          console.log(
            `🏙️  Cidades/Estados: ${
              result.data.cidadeEstado?.successCount || 0
            } migrados, ${result.data.cidadeEstado?.errorCount || 0} erros`
          );
          console.log(
            `👥 Usuários: ${result.data.users?.successCount || 0} migrados, ${
              result.data.users?.errorCount || 0
            } erros`
          );
          console.log(
            `🏢 Clientes/Fornecedores: ${
              result.data.cliFornec?.successCount || 0
            } migrados, ${result.data.cliFornec?.errorCount || 0} erros`
          );
          console.log(
            `💰 Centros de Custo: ${
              result.data.centroCusto?.successCount || 0
            } migrados, ${result.data.centroCusto?.errorCount || 0} erros`
          );
          console.log(
            `📋 Plano de Contas: ${
              result.data.planoContas?.successCount || 0
            } migrados, ${result.data.planoContas?.errorCount || 0} erros`
          );
          console.log(
            `💳 Tipos de Pagamento: ${
              result.data.tipoPag?.successCount || 0
            } migrados, ${result.data.tipoPag?.errorCount || 0} erros`
          );
        }
      } else {
        console.log("\n" + "=".repeat(50));
        console.log("❌ ERRO NA MIGRAÇÃO COMPLETA!");
        console.log("=".repeat(50));
        console.error("Detalhes do erro:", result.error);

        if (result.failedMigrations) {
          console.log("\n🔍 MIGRAÇÕES QUE FALHARAM:");
          result.failedMigrations.forEach((failed) => {
            console.log(`   - ${failed.migration}: ${failed.error}`);
          });
        }
      }

      return result;
    } catch (error) {
      console.log("\n" + "=".repeat(50));
      console.log("💥 ERRO CRÍTICO NA MIGRAÇÃO COMPLETA!");
      console.log("=".repeat(50));
      console.error("Erro:", error);

      return {
        success: false,
        message: "Erro crítico durante a migração completa",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async executeUserMigration() {
    console.log("👥 Executando migração de usuários...");

    try {
      const result = await MigrationController.migrateUsersOnly();
      console.log(
        result.success
          ? "✅ Usuários migrados!"
          : "❌ Erro na migração de usuários"
      );
      return result;
    } catch (error) {
      console.error("💥 Erro crítico na migração de usuários:", error);
      return {
        success: false,
        message: "Erro crítico na migração de usuários",
        error: error.message,
      };
    }
  }

  static async executeCidadeEstadoMigration() {
    console.log("🏙️ Executando migração de cidades e estados...");

    try {
      const result = await MigrationController.migrateCidadeEstadoOnly();
      console.log(
        result.success
          ? "✅ Cidades e estados migrados!"
          : "❌ Erro na migração de cidades e estados"
      );
      return result;
    } catch (error) {
      console.error("💥 Erro crítico na migração de cidades e estados:", error);
      return {
        success: false,
        message: "Erro crítico na migração de cidades e estados",
        error: error.message,
      };
    }
  }

  static async executeCliFornecMigration() {
    console.log("🏢 Executando migração de clientes e fornecedores...");

    try {
      const result = await MigrationController.migrateCliFornecOnly();
      console.log(
        result.success
          ? "✅ Clientes e fornecedores migrados!"
          : "❌ Erro na migração de clientes e fornecedores"
      );
      return result;
    } catch (error) {
      console.error(
        "💥 Erro crítico na migração de clientes e fornecedores:",
        error
      );
      return {
        success: false,
        message: "Erro crítico na migração de clientes e fornecedores",
        error: error.message,
      };
    }
  }

  static async executeCentroCustoMigration() {
    console.log("💰 Executando migração de centros de custo...");

    try {
      const result = await MigrationController.migrateCentroCustoOnly();
      console.log(
        result.success
          ? "✅ Centros de custo migrados!"
          : "❌ Erro na migração de centros de custo"
      );
      return result;
    } catch (error) {
      console.error("💥 Erro crítico na migração de centros de custo:", error);
      return {
        success: false,
        message: "Erro crítico na migração de centros de custo",
        error: error.message,
      };
    }
  }

  static async executePlanoContasMigration() {
    console.log("📋 Executando migração de plano de contas...");

    try {
      const result = await MigrationController.migratePlanoContasOnly();
      console.log(
        result.success
          ? "✅ Plano de contas migrado!"
          : "❌ Erro na migração de plano de contas"
      );
      return result;
    } catch (error) {
      console.error("💥 Erro crítico na migração de plano de contas:", error);
      return {
        success: false,
        message: "Erro crítico na migração de plano de contas",
        error: error.message,
      };
    }
  }

  static async executeTipoPagMigration() {
    console.log("💳 Executando migração de tipos de pagamento...");

    try {
      const result = await MigrationController.migrateTipoPagOnly();
      console.log(
        result.success
          ? "✅ Tipos de pagamento migrados!"
          : "❌ Erro na migração de tipos de pagamento"
      );
      return result;
    } catch (error) {
      console.error(
        "💥 Erro crítico na migração de tipos de pagamento:",
        error
      );
      return {
        success: false,
        message: "Erro crítico na migração de tipos de pagamento",
        error: error.message,
      };
    }
  }
}

global.startMigration = async () => {
  return await MigrationMain.executeMigration();
};

global.startUserMigration = async () => {
  return await MigrationMain.executeUserMigration();
};

global.startCidadeEstadoMigration = async () => {
  return await MigrationMain.executeCidadeEstadoMigration();
};

global.startCliFornecMigration = async () => {
  return await MigrationMain.executeCliFornecMigration();
};

global.startCentroCustoMigration = async () => {
  return await MigrationMain.executeCentroCustoMigration();
};

global.startPlanoContasMigration = async () => {
  return await MigrationMain.executePlanoContasMigration();
};

global.startTipoPagMigration = async () => {
  return await MigrationMain.executeTipoPagMigration();
};

module.exports = {
  MigrationMain,
  startMigration: MigrationMain.executeMigration,
  startUserMigration: MigrationMain.executeUserMigration,
  startCidadeEstadoMigration: MigrationMain.executeCidadeEstadoMigration,
  startCliFornecMigration: MigrationMain.executeCliFornecMigration,
  startCentroCustoMigration: MigrationMain.executeCentroCustoMigration,
  startPlanoContasMigration: MigrationMain.executePlanoContasMigration,
  startTipoPagMigration: MigrationMain.executeTipoPagMigration,
};
