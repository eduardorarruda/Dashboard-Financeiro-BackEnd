const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/userRepository");
const config = require("../config/env");
const { UnauthorizedError, AppError } = require("../utils/errors");
const Validators = require("../utils/validators");

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(email, password) {
    try {
      // Validar dados
      Validators.validateRequired(email, "Email");
      Validators.validateRequired(password, "Senha");
      Validators.validateEmail(email);

      // Buscar usuário
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new UnauthorizedError("Email ou senha incorretos");
      }

      // Verificar senha
      const isValidPassword = await this.userRepository.verifyPassword(
        password,
        user.senha
      );
      if (!isValidPassword) {
        throw new UnauthorizedError("Email ou senha incorretos");
      }

      // Gerar token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Retornar dados do usuário (sem senha) e token
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro no processo de login", 500);
    }
  }

  async register(userData) {
    try {
      // Validar dados
      Validators.validateUserData(userData);

      // Criar usuário
      const user = await this.userRepository.create(userData);

      // Gerar token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        user,
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro no processo de registro", 500);
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedError("Token inválido");
    }
  }

  async refreshToken(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedError("Usuário não encontrado");
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return { token };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new AppError("Erro ao renovar token", 500);
    }
  }
}

module.exports = AuthService;
