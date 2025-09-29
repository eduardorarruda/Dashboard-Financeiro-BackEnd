/**
 * ATENÇÃO: Este arquivo está DEPRECADO!
 *
 * A lógica foi refatorada e distribuída em:
 * - src/config/database.js - Configuração do pool de conexões
 * - src/repositories/*.js - Operações de banco de dados
 * - src/services/*.js - Lógica de negócio
 *
 * Este arquivo é mantido apenas para referência durante a migração.
 * NÃO UTILIZE ESTE ARQUIVO EM NOVOS DESENVOLVIMENTOS.
 */

// Redirecionamento para a nova estrutura
console.warn(
  "⚠️  AVISO: database.js está deprecado. Use os novos módulos em src/"
);

const { pool } = require("./src/config/database");
const UserRepository = require("./src/repositories/userRepository");
const PartnerRepository = require("./src/repositories/partnerRepository");
const FinancialRepository = require("./src/repositories/financialRepository");

// Exporta compatibilidade legada (para não quebrar código antigo)
class DatabaseLegacy {
  static async testConnection() {
    const { testConnection } = require("./src/config/database");
    return await testConnection();
  }

  static async getUserByEmail(email) {
    const userRepo = new UserRepository();
    return await userRepo.findByEmail(email);
  }

  static async verifyLogin(email, password) {
    const AuthService = require("./src/services/authService");
    const authService = new AuthService();
    try {
      const result = await authService.login(email, password);
      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async createUser(name, email, password) {
    const userRepo = new UserRepository();
    try {
      const user = await userRepo.create({ name, email, password });
      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async updateUser(id, updates) {
    const userRepo = new UserRepository();
    try {
      const user = await userRepo.update(id, updates);
      return {
        success: !!user,
        user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async deleteUser(id) {
    const userRepo = new UserRepository();
    try {
      await userRepo.delete(id);
      return {
        success: true,
        message: "Usuário deletado com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getAllUsers() {
    const userRepo = new UserRepository();
    try {
      const users = await userRepo.findAllUsers();
      return {
        success: true,
        users,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getAllPartners() {
    const partnerRepo = new PartnerRepository();
    try {
      const partners = await partnerRepo.findAll();
      return {
        success: true,
        partners,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getTipopag() {
    const financialRepo = new FinancialRepository();
    try {
      const records = await financialRepo.getTipoPag();
      return {
        success: true,
        records,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getAllFinancialRecords() {
    const financialRepo = new FinancialRepository();
    try {
      const records = await financialRepo.findAllRecords();
      return {
        success: true,
        records,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async postFinancialRecords(data) {
    const financialRepo = new FinancialRepository();
    try {
      const newRecord = await financialRepo.createRecord(data);
      return {
        success: true,
        message: "Registro financeiro criado com sucesso!",
        newRecord,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async updateFinancialRecords(id, data) {
    const financialRepo = new FinancialRepository();
    try {
      const updatedRecord = await financialRepo.updateRecord(id, data);
      return {
        success: true,
        message: "Registro financeiro atualizado com sucesso!",
        updatedRecord,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async deleteFinancialRecords(id) {
    const financialRepo = new FinancialRepository();
    try {
      await financialRepo.deleteRecord(id);
      return {
        success: true,
        message: "Registro financeiro excluído com sucesso!",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getCidadeEstado() {
    const partnerRepo = new PartnerRepository();
    try {
      const records = await partnerRepo.getCidadeEstado();
      return {
        success: true,
        records,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async createPartner(data) {
    const partnerRepo = new PartnerRepository();
    try {
      const partner = await partnerRepo.createPartner(data);
      return {
        success: true,
        partner,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async updatePartner(id, data) {
    const partnerRepo = new PartnerRepository();
    try {
      const partner = await partnerRepo.updatePartner(id, data);
      return {
        success: true,
        partner,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getPartner(cgc) {
    const partnerRepo = new PartnerRepository();
    try {
      const partner = await partnerRepo.findByCgc(cgc);
      return {
        success: true,
        partner,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async deletePartner(id) {
    const partnerRepo = new PartnerRepository();
    try {
      await partnerRepo.deletePartner(id);
      return {
        success: true,
        message: "Parceiro excluído com sucesso.",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async closeConnections() {
    try {
      await pool.end();
      console.log("🔒 Conexões com o banco encerradas");
    } catch (error) {
      console.error("❌ Erro ao fechar conexões:", error);
    }
  }
}

module.exports = {
  Database: DatabaseLegacy,
  pool,
};
