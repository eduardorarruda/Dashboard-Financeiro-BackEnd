const UserRepository = require("../repositories/userRepository");
const ApiResponse = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");

class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await this.userRepository.findAllUsers();
      return ApiResponse.success(res, { users }, "Usuários encontrados");
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      // Remove senha do retorno
      delete user.senha;

      return ApiResponse.success(res, { user }, "Usuário encontrado");
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove campos não permitidos
      delete updates.senha;
      delete updates.password;

      const user = await this.userRepository.update(id, updates);

      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      delete user.senha;

      return ApiResponse.success(res, { user }, "Usuário atualizado");
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await this.userRepository.delete(id);

      if (!deleted) {
        throw new NotFoundError("Usuário não encontrado");
      }

      return ApiResponse.success(res, null, "Usuário deletado com sucesso");
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password, newPassword } = req.body;

      if (!password || !newPassword) {
        return ApiResponse.validationError(res, [
          "Senha atual e nova senha são obrigatórias",
        ]);
      }

      // Buscar usuário
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      // Verificar senha atual
      const isValid = await this.userRepository.verifyPassword(
        password,
        user.senha
      );
      if (!isValid) {
        return ApiResponse.unauthorized(res, "Senha atual incorreta");
      }

      // Atualizar senha
      await this.userRepository.updatePassword(id, newPassword);

      return ApiResponse.success(res, null, "Senha atualizada com sucesso");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
