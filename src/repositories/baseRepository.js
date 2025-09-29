const { pool } = require("../config/database");
const { AppError } = require("../utils/errors");

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar registro por ID: ${error.message}`,
        500
      );
    }
  }

  async findAll(orderBy = "id", order = "ASC") {
    try {
      const query = `SELECT * FROM ${this.tableName} ORDER BY ${orderBy} ${order}`;
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(`Erro ao buscar registros: ${error.message}`, 500);
    }
  }

  async create(data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(", ")}) 
        VALUES (${placeholders}) 
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new AppError(`Erro ao criar registro: ${error.message}`, 500);
    }
  }

  async update(id, data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);

      const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");
      values.push(id);

      const query = `
        UPDATE ${this.tableName} 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${values.length} 
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new AppError(`Erro ao atualizar registro: ${error.message}`, 500);
    }
  }

  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new AppError(`Erro ao deletar registro: ${error.message}`, 500);
    }
  }

  async count() {
    try {
      const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      const result = await this.pool.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw new AppError(`Erro ao contar registros: ${error.message}`, 500);
    }
  }
}

module.exports = BaseRepository;
