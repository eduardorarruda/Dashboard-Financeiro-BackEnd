const UserRepository = require("../repositories/userRepository");
const { NotFoundError, AppError } = require("../utils/errors");
const Validators = require("../utils/validators");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    try {
      return await this.userRepository.findAllUsers();
    } catch (error) {
      throw new AppError(`Erro ao buscar usuários: ${error.message}`, 500);
    }
  }

  async getUserById(id) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      delete user.senha;
      return user;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError(`Erro ao buscar usuário: ${error.message}`, 500);
    }
  }

  async updateUser(id, updates) {
    try {
      // Validar email se fornecido
      if (updates.email) {
        Validators.validateEmail(updates.email);
      }

      const user = await this.userRepository.update(id, updates);
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      delete user.senha;
      return user;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AppError)
        throw error;
      throw new AppError(`Erro ao atualizar usuário: ${error.message}`, 500);
    }
  }

  async deleteUser(id) {
    try {
      const deleted = await this.userRepository.delete(id);
      if (!deleted) {
        throw new NotFoundError("Usuário não encontrado");
      }
      return deleted;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError(`Erro ao deletar usuário: ${error.message}`, 500);
    }
  }

  async updatePassword(id, currentPassword, newPassword) {
    try {
      // Validar nova senha
      Validators.validatePassword(newPassword);

      // Buscar usuário
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      // Verificar senha atual
      const isValid = await this.userRepository.verifyPassword(
        currentPassword,
        user.senha
      );
      if (!isValid) {
        throw new AppError("Senha atual incorreta", 401);
      }

      // Atualizar senha
      await this.userRepository.updatePassword(id, newPassword);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AppError)
        throw error;
      throw new AppError(`Erro ao atualizar senha: ${error.message}`, 500);
    }
  }
}

module.exports = UserService;
