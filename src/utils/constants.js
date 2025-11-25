const FINANCIAL_TYPES = {
  RECEITA: "R",
  DESPESA: "D",
};

const PAYMENT_STATUS = {
  ABERTO: "A",
  PAGO: "P",
};

const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  CPF_LENGTH: 11,
  CNPJ_LENGTH: 14,
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Não autorizado",
  FORBIDDEN: "Acesso negado",
  NOT_FOUND: "Recurso não encontrado",
  VALIDATION_ERROR: "Dados inválidos",
  INTERNAL_ERROR: "Erro interno do servidor",
  EMAIL_IN_USE: "Email já está em uso",
  INVALID_CREDENTIALS: "Email ou senha incorretos",
  TOKEN_EXPIRED: "Token expirado",
  TOKEN_INVALID: "Token inválido",
};

const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login realizado com sucesso",
  REGISTER_SUCCESS: "Usuário criado com sucesso",
  UPDATE_SUCCESS: "Atualizado com sucesso",
  DELETE_SUCCESS: "Deletado com sucesso",
  CREATED_SUCCESS: "Criado com sucesso",
};

module.exports = {
  FINANCIAL_TYPES,
  PAYMENT_STATUS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
