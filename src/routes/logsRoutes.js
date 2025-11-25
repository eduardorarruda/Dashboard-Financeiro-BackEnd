const express = require("express");
const router = express.Router();
const logService = require("../services/logService");

router.get("/logs", (req, res) => {
  // Configurar headers para SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Registrar este response como subscriber
  const service = logService.getInstance();
  const subscriberId = service.subscribe(res);

  console.log(
    `📡 Cliente conectado para logs em tempo real. Total de subscribers: ${service.getSubscriberCount()}`
  );

  // Manter conexão viva
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch (error) {
      clearInterval(heartbeatInterval);
      service.unsubscribe(subscriberId);
    }
  }, 30000); // A cada 30 segundos

  // Limpar quando cliente desconectar
  res.on("close", () => {
    clearInterval(heartbeatInterval);
    service.unsubscribe(subscriberId);
    console.log(
      `📡 Cliente desconectado. Total de subscribers: ${service.getSubscriberCount()}`
    );
    res.end();
  });

  res.on("error", () => {
    clearInterval(heartbeatInterval);
    service.unsubscribe(subscriberId);
  });
});

module.exports = router;
