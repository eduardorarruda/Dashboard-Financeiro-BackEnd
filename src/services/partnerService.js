const PartnerRepository = require("../repositories/partnerRepository");
const { NotFoundError, AppError } = require("../utils/errors");
const Validators = require("../utils/validators");

class PartnerService {
  constructor() {
    this.partnerRepository = new PartnerRepository();
  }

  async getAllPartners() {
    try {
      return await this.partnerRepository.findAll("razaosocial", "ASC");
    } catch (error) {
      throw new AppError(`Erro ao buscar parceiros: ${error.message}`, 500);
    }
  }

  async getPartnerById(id) {
    try {
      const partner = await this.partnerRepository.findById(id);
      if (!partner) {
        throw new NotFoundError("Parceiro não encontrado");
      }
      return partner;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError(`Erro ao buscar parceiro: ${error.message}`, 500);
    }
  }

  async getPartnerByCgc(cgc) {
    try {
      const partner = await this.partnerRepository.findByCgc(cgc);
      if (!partner) {
        throw new NotFoundError("Parceiro não encontrado");
      }
      return partner;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError(`Erro ao buscar parceiro: ${error.message}`, 500);
    }
  }

  async createPartner(partnerData) {
    try {
      // Validar dados
      Validators.validatePartnerData(partnerData);

      return await this.partnerRepository.createPartner(partnerData);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao criar parceiro: ${error.message}`, 500);
    }
  }

  async updatePartner(id, partnerData) {
    try {
      // Validar email se fornecido
      if (partnerData.email) {
        Validators.validateEmail(partnerData.email);
      }

      const partner = await this.partnerRepository.updatePartner(
        id,
        partnerData
      );
      return partner;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AppError)
        throw error;
      throw new AppError(`Erro ao atualizar parceiro: ${error.message}`, 500);
    }
  }

  async deletePartner(id) {
    try {
      await this.partnerRepository.deletePartner(id);
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao deletar parceiro: ${error.message}`, 500);
    }
  }

  async getCidadeEstado() {
    try {
      return await this.partnerRepository.getCidadeEstado();
    } catch (error) {
      throw new AppError(
        `Erro ao buscar cidades e estados: ${error.message}`,
        500
      );
    }
  }
}

module.exports = PartnerService;
