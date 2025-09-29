const AuthService = require("../services/authService");
const ApiResponse = require("../utils/responses");

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      return ApiResponse.success(res, result, "Login realizado com sucesso");
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const userData = req.body;
      const result = await this.authService.register(userData);

      return ApiResponse.success(
        res,
        result,
        "Usuário criado com sucesso",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await this.authService.refreshToken(userId);

      return ApiResponse.success(res, result, "Token renovado com sucesso");
    } catch (error) {
      next(error);
    }
  }

  async me(req, res) {
    try {
      const user = req.user;
      return ApiResponse.success(res, { user }, "Dados do usuário");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
