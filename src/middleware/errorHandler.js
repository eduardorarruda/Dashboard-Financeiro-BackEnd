const ApiResponse = require("../utils/responses");
const { AppError, ValidationError } = require("../utils/errors");

const errorHandler = (error, req, res, next) => {
  console.error(`❌ Erro ${req.method} ${req.path}:`, error);

  // Erro de validação customizado
  if (error instanceof ValidationError) {
    return ApiResponse.validationError(res, error.errors || [error.message]);
  }

  // Erro customizado da aplicação
  if (error instanceof AppError) {
    return ApiResponse.error(res, error.message, error.statusCode, error);
  }

  // Erro de violação de constraint única do PostgreSQL
  if (error.code === "23505") {
    return ApiResponse.error(res, "Registro já existe", 409);
  }

  // Erro de violação de chave estrangeira
  if (error.code === "23503") {
    return ApiResponse.error(res, "Referência inválida", 400);
  }

  // Erro de conexão com banco
  if (error.code === "ECONNREFUSED") {
    return ApiResponse.error(res, "Erro de conexão com banco de dados", 503);
  }

  // Erro padrão
  return ApiResponse.error(res, "Erro interno do servidor", 500, error);
};

const notFoundHandler = (req, res) => {
  ApiResponse.notFound(res, `Rota ${req.method} ${req.path} não encontrada`);
};

module.exports = { errorHandler, notFoundHandler };
