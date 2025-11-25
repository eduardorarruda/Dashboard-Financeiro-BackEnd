const BaseRepository = require("./baseRepository");
const { AppError, NotFoundError } = require("../utils/errors");

class FinancialRepository extends BaseRepository {
  constructor() {
    super("financeiro");
  }

  async findAllRecords() {
    try {
      const query = `
        SELECT 
          f.id,
          f.tipo,
          f.situacao,
          f.numero,
          f.valor,
          f.datavencimento,
          f.descricao,
          f.idtipopag,
          f.id_clifornec,
          c.razaosocial AS parceiro_nome 
        FROM financeiro AS f
        JOIN clifornec AS c ON f.id_clifornec = c.id
        ORDER BY f.datavencimento DESC
      `;
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar registros financeiros: ${error.message}`,
        500
      );
    }
  }

  async createRecord(data) {
    try {
      const query = `
        INSERT INTO financeiro (
          descricao, idtipopag, datavencimento, valor, situacao, tipo, numero, id_clifornec
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;

      const values = [
        data.descricao,
        data.idtipopag || null,
        data.datavencimento,
        data.valor,
        data.situacao || "A", // A = Aberto, P = Pago
        data.tipo, // R = Receita, D = Despesa
        data.numero || null,
        data.id_clifornec,
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new AppError(
        `Erro ao criar registro financeiro: ${error.message}`,
        500
      );
    }
  }

  async updateRecord(id, data) {
    try {
      const allowedFields = [
        "descricao",
        "idtipopag",
        "datavencimento",
        "valor",
        "situacao",
        "tipo",
        "numero",
        "id_clifornec",
      ];

      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          setClauses.push(`${field} = $${paramIndex++}`);
          values.push(data[field]);
        }
      });

      if (setClauses.length === 0) {
        throw new AppError("Nenhum campo válido para atualizar", 400);
      }

      values.push(id);

      const query = `
        UPDATE financeiro
        SET ${setClauses.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING *;
      `;

      const result = await this.pool.query(query, values);

      if (result.rowCount === 0) {
        throw new NotFoundError("Registro financeiro não encontrado");
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError || error instanceof NotFoundError)
        throw error;
      throw new AppError(
        `Erro ao atualizar registro financeiro: ${error.message}`,
        500
      );
    }
  }

  async deleteRecord(id) {
    try {
      const query = "DELETE FROM financeiro WHERE id = $1 RETURNING id";
      const result = await this.pool.query(query, [id]);

      if (result.rowCount === 0) {
        throw new NotFoundError("Registro financeiro não encontrado");
      }

      return result.rows[0];
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
      const query = "SELECT * FROM tipopag ORDER BY nome ASC";
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar tipos de pagamento: ${error.message}`,
        500
      );
    }
  }

  async findByPeriod(startDate, endDate) {
    try {
      const query = `
        SELECT 
          f.*,
          c.razaosocial AS parceiro_nome 
        FROM financeiro AS f
        JOIN clifornec AS c ON f.id_clifornec = c.id
        WHERE f.datavencimento BETWEEN $1 AND $2
        ORDER BY f.datavencimento DESC
      `;
      const result = await this.pool.query(query, [startDate, endDate]);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar registros por período: ${error.message}`,
        500
      );
    }
  }

  async findByType(type) {
    try {
      const query = `
        SELECT 
          f.*,
          c.razaosocial AS parceiro_nome 
        FROM financeiro AS f
        JOIN clifornec AS c ON f.id_clifornec = c.id
        WHERE f.tipo = $1
        ORDER BY f.datavencimento DESC
      `;
      const result = await this.pool.query(query, [type]);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar registros por tipo: ${error.message}`,
        500
      );
    }
  }

  async findBySituacao(situacao) {
    try {
      const query = `
        SELECT 
          f.*,
          c.razaosocial AS parceiro_nome 
        FROM financeiro AS f
        JOIN clifornec AS c ON f.id_clifornec = c.id
        WHERE f.situacao = $1
        ORDER BY f.datavencimento DESC
      `;
      const result = await this.pool.query(query, [situacao]);
      return result.rows;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar registros por situação: ${error.message}`,
        500
      );
    }
  }
}

module.exports = FinancialRepository;
