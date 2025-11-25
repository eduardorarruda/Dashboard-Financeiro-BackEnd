const BaseRepository = require("./baseRepository");
const { AppError, NotFoundError } = require("../utils/errors");

class PartnerRepository extends BaseRepository {
  constructor() {
    super("clifornec");
  }

  async findByCgc(cgc) {
    try {
      const query = `
        SELECT c.*, ci.nomecidade, ci.nomeestado
        FROM clifornec c
        LEFT JOIN cidadeestado ci ON ci.id = c.idcidadeestado
        WHERE c.cgc = $1
      `;
      const result = await this.pool.query(query, [cgc]);
      return result.rows[0] || null;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar parceiro por CGC: ${error.message}`,
        500
      );
    }
  }

  async findAll(orderBy = "razaosocial", order = "ASC") {
    try {
      const query = `
        SELECT 
          id, 
          cgc, 
          razaosocial, 
          nomefantasia, 
          numerocel, 
          numeroend, 
          cep, 
          rua, 
          bairro,
          email,
          idcidadeestado
        FROM clifornec 
        ORDER BY ${orderBy} ${order}
      `;
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(`Erro ao buscar parceiros: ${error.message}`, 500);
    }
  }

  async createPartner(data) {
    try {
      // Verificar se CGC já existe
      const existingPartner = await this.findByCgc(data.cgc);
      if (existingPartner) {
        throw new AppError("CGC/CNPJ já cadastrado", 409);
      }

      const query = `
        INSERT INTO clifornec 
          (cgc, razaosocial, nomefantasia, numerocel, numeroend, cep, rua, bairro, idcidadeestado, email)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;

      const values = [
        data.cgc,
        data.razaoSocial,
        data.nomeFantasia || null,
        data.celular ? data.celular.replace(/\D/g, "") : null,
        data.numero || null,
        data.cep || null,
        data.rua || null,
        data.bairro || null,
        data.cidadeEstado || null,
        data.email,
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao criar parceiro: ${error.message}`, 500);
    }
  }

  async updatePartner(id, data) {
    try {
      const query = `
        UPDATE clifornec SET
          cgc = $1,
          razaosocial = $2,
          nomefantasia = $3,
          numerocel = $4,
          numeroend = $5,
          cep = $6,
          rua = $7,
          bairro = $8,
          idcidadeestado = $9, 
          email = $10
        WHERE id = $11
        RETURNING *;
      `;

      const values = [
        data.cgc,
        data.razaoSocial,
        data.nomeFantasia || null,
        data.celular ? data.celular.replace(/\D/g, "") : null,
        data.numero || null,
        data.cep || null,
        data.rua || null,
        data.bairro || null,
        data.cidadeEstado || null,
        data.email,
        id,
      ];

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundError("Parceiro não encontrado");
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError(`Erro ao atualizar parceiro: ${error.message}`, 500);
    }
  }

  async deletePartner(id) {
    try {
      // Verificar se possui movimentações financeiras
      const checkQuery =
        "SELECT 1 FROM financeiro WHERE id_clifornec = $1 LIMIT 1";
      const checkResult = await this.pool.query(checkQuery, [id]);

      if (checkResult.rowCount > 0) {
        throw new AppError(
          "Este parceiro não pode ser excluído pois possui movimentações financeiras associadas",
          400
        );
      }

      const deleteQuery = "DELETE FROM clifornec WHERE id = $1 RETURNING id";
      const result = await this.pool.query(deleteQuery, [id]);

      if (result.rowCount === 0) {
        throw new NotFoundError("Parceiro não encontrado");
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError || error instanceof NotFoundError)
        throw error;
      throw new AppError(`Erro ao deletar parceiro: ${error.message}`, 500);
    }
  }

  async getCidadeEstado() {
    try {
      const query = "SELECT * FROM cidadeestado ORDER BY nomecidade ASC";
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar cidades e estados: ${error.message}`,
        500
      );
    }
  }
}

module.exports = PartnerRepository;
