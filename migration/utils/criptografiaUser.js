class JvCaesarCipher {
  // Função para converter chave em número
  static strToIntDef(str, defaultValue) {
    const num = parseInt(str, 10);
    return isNaN(num) ? defaultValue : num;
  }

  // Função de decodificação
  static decode(key, buffer) {
    if (!buffer || buffer.length === 0) return buffer;

    let n = this.strToIntDef(key, 13);
    if (n <= 0 || n >= 256) {
      n = 13;
    }

    const result = [];

    for (let i = 0; i < buffer.length; i++) {
      const charCode = buffer.charCodeAt(i);
      const decodedCode = charCode - n;
      result.push(String.fromCharCode(decodedCode));
    }

    return result.join("");
  }
}

function decryptPassword(encryptedPassword) {
  const key = "SOFTKEYAGRO2010";

  try {
    const decrypted = JvCaesarCipher.decode(key, encryptedPassword);
    return decrypted;
  } catch (error) {
    console.error("Erro ao descriptografar senha:", error);

    let decrypted = "";
    const shiftKey = 13;

    for (let i = 0; i < encryptedPassword.length; i++) {
      const charCode = encryptedPassword.charCodeAt(i);
      const decryptedCharCode = charCode - shiftKey;
      decrypted += String.fromCharCode(decryptedCharCode);
    }
    return decrypted;
  }
}
