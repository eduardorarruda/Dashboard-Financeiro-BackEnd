const express = require("express");
const UserController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const userController = new UserController();

// Todas as rotas de usuário requerem autenticação
router.use(authMiddleware);

// Rotas
router.get("/", userController.getAllUsers.bind(userController));
router.get("/:id", userController.getUserById.bind(userController));
router.put("/:id", userController.updateUser.bind(userController));
router.delete("/:id", userController.deleteUser.bind(userController));
router.put("/:id/password", userController.updatePassword.bind(userController));

module.exports = router;
