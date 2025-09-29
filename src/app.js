const express = require("express");
const cors = require("cors");
const config = require("./config/env");

// Middleware
const requestLogger = require("./middleware/requestLogger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Rotas
const routes = require("./routes");

const app = express();

// Middlewares globais
app.use(
  cors({
    origin:
      config.nodeEnv === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
if (config.nodeEnv !== "test") {
  app.use(requestLogger);
}

// Rotas principais
app.use("/api", routes);

// Middleware de rotas não encontradas
app.use(notFoundHandler);

// Middleware global de tratamento de erros
app.use(errorHandler);

module.exports = app;
