const express = require("express");
const FinancialController = require("../controllers/financialController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const financialController = new FinancialController();

// Todas as rotas financeiras requerem autenticação
router.use(authMiddleware);

// Rotas
router.get("/", financialController.getAllRecords.bind(financialController));
router.get(
  "/tipo-pagamento",
  financialController.getTipoPag.bind(financialController)
);
router.get("/:id", financialController.getRecordById.bind(financialController));
router.post("/", financialController.createRecord.bind(financialController));
router.put("/:id", financialController.updateRecord.bind(financialController));
router.put(
  "/:id/payment-status",
  financialController.updatePaymentStatus.bind(financialController)
);
router.delete(
  "/:id",
  financialController.deleteRecord.bind(financialController)
);

module.exports = router;
