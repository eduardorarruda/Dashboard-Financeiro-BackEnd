const FinancialRepository = require("../repositories/financialRepository");
const ApiResponse = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");

class FinancialController {
  constructor() {
    this.financialRepository = new FinancialRepository();
  }

  async getAllRecords(req, res, next) {
    try {
      const records = await this.financialRepository.findAllRecords();
      return ApiResponse.success(
        res,
        { records },
        "Registros financeiros encontrados"
      );
    } catch (error) {
      next(error);
    }
  }

  async getRecordById(req, res, next) {
    try {
      const { id } = req.params;
      const record = await this.financialRepository.findById(id);

      if (!record) {
        throw new NotFoundError("Registro financeiro não encontrado");
      }

      return ApiResponse.success(
        res,
        { record },
        "Registro financeiro encontrado"
      );
    } catch (error) {
      next(error);
    }
  }

  async createRecord(req, res, next) {
    try {
      const data = req.body;

      // Validar campos obrigatórios
      if (!data.descricao || !data.valor || !data.tipo || !data.id_clifornec) {
        return ApiResponse.validationError(res, [
          "Descrição, valor, tipo e parceiro são obrigatórios",
        ]);
      }

      const record = await this.financialRepository.createRecord(data);

      return ApiResponse.success(
        res,
        { record },
        "Registro financeiro criado com sucesso",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const record = await this.financialRepository.updateRecord(id, data);

      if (!record) {
        throw new NotFoundError("Registro financeiro não encontrado");
      }

      return ApiResponse.success(
        res,
        { record },
        "Registro financeiro atualizado com sucesso"
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req, res, next) {
    try {
      const { id } = req.params;
      await this.financialRepository.deleteRecord(id);

      return ApiResponse.success(
        res,
        null,
        "Registro financeiro deletado com sucesso"
      );
    } catch (error) {
      next(error);
    }
  }

  async getTipoPag(req, res, next) {
    try {
      const records = await this.financialRepository.getTipoPag();
      return ApiResponse.success(
        res,
        { records },
        "Tipos de pagamento encontrados"
      );
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { situacao } = req.body;

      if (!situacao || !["A", "P"].includes(situacao)) {
        return ApiResponse.validationError(res, [
          "Situação deve ser 'A' (Aberto) ou 'P' (Pago)",
        ]);
      }

      const record = await this.financialRepository.updateRecord(id, {
        situacao,
      });

      if (!record) {
        throw new NotFoundError("Registro financeiro não encontrado");
      }

      return ApiResponse.success(
        res,
        { record },
        "Status de pagamento atualizado com sucesso"
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FinancialController;
