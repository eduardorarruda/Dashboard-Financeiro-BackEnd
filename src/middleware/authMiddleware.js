const jwt = require("jsonwebtoken");
const config = require("../config/env");
const ApiResponse = require("../utils/responses");
const { UnauthorizedError } = require("../utils/errors");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return ApiResponse.unauthorized(res, "Token de acesso requerido");
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return ApiResponse.unauthorized(res, "Token inválido");
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return ApiResponse.unauthorized(res, "Token inválido");
    }

    if (error.name === "TokenExpiredError") {
      return ApiResponse.unauthorized(res, "Token expirado");
    }

    return ApiResponse.error(res, "Erro na autenticação", 500, error);
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      if (token) {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

module.exports = { authMiddleware, optionalAuth };
