const validator = require("validator");
const { ValidationError } = require("./errors");

class Validators {
  static validateEmail(email) {
    if (!email || !validator.isEmail(email)) {
      throw new ValidationError("Email inválido");
    }
    return true;
  }

  static validatePassword(password, minLength = 6) {
    if (!password || password.length < minLength) {
      throw new ValidationError(
        `Senha deve ter pelo menos ${minLength} caracteres`
      );
    }
    return true;
  }

  static validateRequired(value, fieldName) {
    if (!value || (typeof value === "string" && !value.trim())) {
      throw new ValidationError(`${fieldName} é obrigatório`);
    }
    return true;
  }

  static validateCPF_CNPJ(document) {
    if (!document) {
      throw new ValidationError("CPF/CNPJ é obrigatório");
    }

    const cleanDoc = document.replace(/\D/g, "");

    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      throw new ValidationError("CPF/CNPJ deve ter 11 ou 14 dígitos");
    }

    return true;
  }

  static validateUserData({ name, email, password }) {
    const errors = [];

    try {
      this.validateRequired(name, "Nome");
    } catch (error) {
      errors.push(error.message);
    }

    try {
      this.validateEmail(email);
    } catch (error) {
      errors.push(error.message);
    }

    try {
      this.validatePassword(password);
    } catch (error) {
      errors.push(error.message);
    }

    if (errors.length > 0) {
      throw new ValidationError("Dados inválidos", errors);
    }

    return true;
  }

  static validatePartnerData(data) {
    const errors = [];
    const required = ["cgc", "razaoSocial", "email"];

    required.forEach((field) => {
      try {
        this.validateRequired(data[field], field);
      } catch (error) {
        errors.push(error.message);
      }
    });

    try {
      this.validateCPF_CNPJ(data.cgc);
    } catch (error) {
      errors.push(error.message);
    }

    try {
      this.validateEmail(data.email);
    } catch (error) {
      errors.push(error.message);
    }

    if (errors.length > 0) {
      throw new ValidationError("Dados inválidos", errors);
    }

    return true;
  }
}

module.exports = Validators;
