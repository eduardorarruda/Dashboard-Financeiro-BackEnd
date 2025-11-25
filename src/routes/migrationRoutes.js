const express = require("express");
const MigrationController = require("../controllers/migrationController");
const config = require("../config/env");
const logsRoutes = require("./logsRoutes");

const router = express.Router();
const migrationController = new MigrationController();

// Middleware para verificar ambiente de desenvolvimento
const devOnlyMiddleware = (req, res, next) => {
  if (config.nodeEnv !== "development") {
    return res.status(403).json({
      success: false,
      message:
        "Esta operação é permitida apenas em ambiente de desenvolvimento",
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// Aplicar middleware em todas as rotas
router.use(devOnlyMiddleware);

// Rotas
router.post(
  "/execute",
  migrationController.executeMigration.bind(migrationController)
);
router.get(
  "/test",
  migrationController.testConnections.bind(migrationController)
);
router.get(
  "/stats",
  migrationController.getMigrationStats.bind(migrationController)
);

// Rota para streaming de logs
router.use("/", logsRoutes);

module.exports = router;
