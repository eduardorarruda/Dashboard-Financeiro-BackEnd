const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const partnerRoutes = require("./partnerRoutes");
const financialRoutes = require("./financialRoutes");
const migrationRoutes = require("./migrationRoutes");

const router = express.Router();

//Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando corretamente",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

//Rotas
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/partners", partnerRoutes);
router.use("/financial", financialRoutes);
router.use("/migration", migrationRoutes);

module.exports = router;
