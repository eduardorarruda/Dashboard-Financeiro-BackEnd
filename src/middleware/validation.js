const { ValidationError } = require("../utils/errors");

class ValidationMiddleware {
  static validateLoginData(req, res, next) {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !email.trim()) {
      errors.push("Email é obrigatório");
    }

    if (!password || !password.trim()) {
      errors.push("Senha é obrigatória");
    }

    if (errors.length > 0) {
      throw new ValidationError("Dados inválidos", errors);
    }

    next();
  }

  static validateRegisterData(req, res, next) {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || !name.trim()) {
      errors.push("Nome é obrigatório");
    }

    if (!email || !email.trim()) {
      errors.push("Email é obrigatório");
    }

    if (!password || !password.trim()) {
      errors.push("Senha é obrigatória");
    } else if (password.length < 6) {
      errors.push("Senha deve ter pelo menos 6 caracteres");
    }

    if (errors.length > 0) {
      throw new ValidationError("Dados inválidos", errors);
    }

    next();
  }

  static validatePartnerData(req, res, next) {
    const { cgc, razaoSocial, email } = req.body;
    const errors = [];

    if (!cgc || !cgc.trim()) {
      errors.push("CGC/CNPJ é obrigatório");
    }

    if (!razaoSocial || !razaoSocial.trim()) {
      errors.push("Razão Social é obrigatória");
    }

    if (!email || !email.trim()) {
      errors.push("Email é obrigatório");
    }

    if (errors.length > 0) {
      throw new ValidationError("Dados inválidos", errors);
    }

    next();
  }

  static validateFinancialData(req, res, next) {
    const { descricao, valor, tipo, id_clifornec, datavencimento } = req.body;
    const errors = [];

    if (!descricao || !descricao.trim()) {
      errors.push("Descrição é obrigatória");
    }

    if (!valor || isNaN(valor) || valor <= 0) {
      errors.push("Valor deve ser um número maior que zero");
    }

    if (!tipo || !["R", "D"].includes(tipo)) {
      errors.push("Tipo deve ser 'R' (Receita) ou 'D' (Despesa)");
    }

    if (!id_clifornec) {
      errors.push("Parceiro é obrigatório");
    }

    if (!datavencimento) {
      errors.push("Data de vencimento é obrigatória");
    }

    if (errors.length > 0) {
      throw new ValidationError("Dados inválidos", errors);
    }

    next();
  }
}

module.exports = ValidationMiddleware;
