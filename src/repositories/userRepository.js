const BaseRepository = require("./baseRepository");
const bcrypt = require("bcrypt");
const { AppError, NotFoundError } = require("../utils/errors");

class UserRepository extends BaseRepository {
  constructor() {
    super("usuario");
  }

  async findByEmail(email) {
    try {
      const query = "SELECT * FROM usuario WHERE email = $1";
      const result = await this.pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new AppError(
        `Erro ao buscar usuário por email: ${error.message}`,
        500
      );
    }
  }

  async create(userData) {
    try {
      const { name, email, password } = userData;

      // Verificar se email já existe
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new AppError("Email já está em uso", 409);
      }

      // Hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await super.create({
        name,
        email,
        senha: hashedPassword,
      });

      // Remover senha do retorno
      delete user.senha;
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao criar usuário: ${error.message}`, 500);
    }
  }

  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new AppError("Erro na verificação de senha", 500);
    }
  }

  async findAllUsers() {
    try {
      const query = `
        SELECT id, name, email, created_at, updated_at 
        FROM usuario 
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new AppError(`Erro ao buscar usuários: ${error.message}`, 500);
    }
  }

  async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = `
        UPDATE usuario 
        SET senha = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING id, name, email
      `;
      const result = await this.pool.query(query, [hashedPassword, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new AppError(`Erro ao atualizar senha: ${error.message}`, 500);
    }
  }
}

module.exports = UserRepository;
