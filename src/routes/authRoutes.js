const express = require("express");
const AuthController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const authController = new AuthController();

// Bind dos métodos ao contexto correto
router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post(
  "/refresh",
  authMiddleware,
  authController.refreshToken.bind(authController)
);
router.get("/me", authMiddleware, authController.me.bind(authController));

module.exports = router;
