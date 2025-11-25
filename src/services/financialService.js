const FinancialRepository = require("../repositories/financialRepository");
const { NotFoundError, AppError, ValidationError } = require("../utils/errors");

class FinancialService {
  constructor() {
    this.financialRepository = new FinancialRepository();
  }

  async getAllRecords() {
    try {
      return await this.financialRepository.findAllRecords();
    } catch (error) {
      throw new AppError(
        `Erro ao buscar registros financeiros: ${error.message}`,
        500
      );
    }
  }

  async getRecordById(id) {
    try {
      const record = await this.financialRepository.findById(id);
      if (!record) {
        throw new NotFoundError("Registro financeiro não encontrado");
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError(
        `Erro ao buscar registro financeiro: ${error.message}`,
        500
      );
    }
  }

  async createRecord(data) {
    try {
      // Validar campos obrigatórios
      this._validateRecordData(data);

      return await this.financialRepository.createRecord(data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AppError)
        throw error;
      throw new AppError(
        `Erro ao criar registro financeiro: ${error.message}`,
        500
      );
    }
  }

  async updateRecord(id, data) {
    try {
      return await this.financialRepository.updateRecord(id, data);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AppError)
        throw error;
      throw new AppError(
        `Erro ao atualizar registro financeiro: ${error.message}`,
        500
      );
    }
  }

  async deleteRecord(id) {
    try {
      await this.financialRepository.deleteRecord(id);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError(
        `Erro ao deletar registro financeiro: ${error.message}`,
        500
      );
    }
  }

  async getTipoPag() {
    try {
      return await this.financialRepository.getTipoPag();
    } catch (error) {
      throw new AppError(
        `Erro ao buscar tipos de pagamento: ${error.message}`,
        500
      );
    }
  }

  async updatePaymentStatus(id, situacao) {
    try {
      if (!["A", "P"].includes(situacao)) {
        throw new ValidationError(
          "Situação deve ser 'A' (Aberto) ou 'P' (Pago)"
        );
      }

      return await this.financialRepository.updateRecord(id, { situacao });
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof AppError
      )
        throw error;
      throw new AppError(
        `Erro ao atualizar status de pagamento: ${error.message}`,
        500
      );
    }
  }

  async getRecordsByPeriod(startDate, endDate) {
    try {
      return await this.financialRepository.findByPeriod(startDate, endDate);
    } catch (error) {
      throw new AppError(
        `Erro ao buscar registros por período: ${error.message}`,
        500
      );
    }
  }

  async getRecordsByType(type) {
    try {
      if (!["R", "D"].includes(type)) {
        throw new ValidationError(
          "Tipo deve ser 'R' (Receita) ou 'D' (Despesa)"
        );
      }

      return await this.financialRepository.findByType(type);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AppError)
        throw error;
      throw new AppError(
        `Erro ao buscar registros por tipo: ${error.message}`,
        500
      );
    }
  }

  async getRecordsBySituacao(situacao) {
    try {
      if (!["A", "P"].includes(situacao)) {
        throw new ValidationError(
          "Situação deve ser 'A' (Aberto) ou 'P' (Pago)"
        );
      }

      return await this.financialRepository.findBySituacao(situacao);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AppError)
        throw error;
      throw new AppError(
        `Erro ao buscar registros por situação: ${error.message}`,
        500
      );
    }
  }

  _validateRecordData(data) {
    const errors = [];

    if (!data.descricao || !data.descricao.trim()) {
      errors.push("Descrição é obrigatória");
    }

    if (!data.valor || isNaN(data.valor) || data.valor <= 0) {
      errors.push("Valor deve ser um número maior que zero");
    }

    if (!data.tipo || !["R", "D"].includes(data.tipo)) {
      errors.push("Tipo deve ser 'R' (Receita) ou 'D' (Despesa)");
    }

    if (!data.id_clifornec) {
      errors.push("Parceiro é obrigatório");
    }

    if (!data.datavencimento) {
      errors.push("Data de vencimento é obrigatória");
    }

    if (errors.length > 0) {
      throw new ValidationError("Dados inválidos", errors);
    }
  }
}

module.exports = FinancialService;
