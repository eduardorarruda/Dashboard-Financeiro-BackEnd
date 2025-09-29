const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log da requisição
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);

  if (req.body && Object.keys(req.body).length > 0) {
    // Não logar senhas
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = "[HIDDEN]";
    if (logBody.senha) logBody.senha = "[HIDDEN]";

    console.log("📋 Body:", JSON.stringify(logBody, null, 2));
  }

  // Override do res.json para capturar tempo de resposta
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;
    console.log(
      `📤 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
    return originalJson.call(this, data);
  };

  next();
};

module.exports = requestLogger;
