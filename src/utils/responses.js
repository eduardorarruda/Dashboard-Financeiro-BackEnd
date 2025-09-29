class ApiResponse {
  static success(res, data = null, message = "Sucesso", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res, message = "Erro interno", statusCode = 500, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (error && process.env.NODE_ENV === "development") {
      response.error = error;
      response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: "Dados inválidos",
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  static unauthorized(res, message = "Não autorizado") {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static forbidden(res, message = "Acesso negado") {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static notFound(res, message = "Recurso não encontrado") {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ApiResponse;
