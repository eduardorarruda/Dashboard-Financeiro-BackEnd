const PartnerRepository = require("../repositories/partnerRepository");
const ApiResponse = require("../utils/responses");
const Validators = require("../utils/validators");
const { NotFoundError } = require("../utils/errors");

class PartnerController {
  constructor() {
    this.partnerRepository = new PartnerRepository();
  }

  async getAllPartners(req, res, next) {
    try {
      const partners = await this.partnerRepository.findAll(
        "razaosocial",
        "ASC"
      );
      return ApiResponse.success(res, { partners }, "Parceiros encontrados");
    } catch (error) {
      next(error);
    }
  }

  async getPartnerById(req, res, next) {
    try {
      const { id } = req.params;
      const partner = await this.partnerRepository.findById(id);

      if (!partner) {
        throw new NotFoundError("Parceiro não encontrado");
      }

      return ApiResponse.success(res, { partner }, "Parceiro encontrado");
    } catch (error) {
      next(error);
    }
  }

  async getPartnerByCgc(req, res, next) {
    try {
      const { cgc } = req.params;
      const partner = await this.partnerRepository.findByCgc(cgc);

      if (!partner) {
        throw new NotFoundError("Parceiro não encontrado");
      }

      return ApiResponse.success(res, { partner }, "Parceiro encontrado");
    } catch (error) {
      next(error);
    }
  }

  async createPartner(req, res, next) {
    try {
      const partnerData = req.body;

      // Validar dados
      Validators.validatePartnerData(partnerData);

      const partner = await this.partnerRepository.createPartner(partnerData);

      return ApiResponse.success(
        res,
        { partner },
        "Parceiro criado com sucesso",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async updatePartner(req, res, next) {
    try {
      const { id } = req.params;
      const partnerData = req.body;

      // Validar dados (se houver)
      if (partnerData.email) {
        Validators.validateEmail(partnerData.email);
      }

      const partner = await this.partnerRepository.updatePartner(
        id,
        partnerData
      );

      if (!partner) {
        throw new NotFoundError("Parceiro não encontrado");
      }

      return ApiResponse.success(
        res,
        { partner },
        "Parceiro atualizado com sucesso"
      );
    } catch (error) {
      next(error);
    }
  }

  async deletePartner(req, res, next) {
    try {
      const { id } = req.params;
      await this.partnerRepository.deletePartner(id);

      return ApiResponse.success(res, null, "Parceiro deletado com sucesso");
    } catch (error) {
      next(error);
    }
  }

  async getCidadeEstado(req, res, next) {
    try {
      const cidadesEstados = await this.partnerRepository.getCidadeEstado();
      return ApiResponse.success(
        res,
        { records: cidadesEstados },
        "Cidades e estados encontrados"
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PartnerController;
