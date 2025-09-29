const express = require("express");
const PartnerController = require("../controllers/partnerController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const partnerController = new PartnerController();

// Todas as rotas de parceiro requerem autenticação
router.use(authMiddleware);

// Rotas
router.get("/", partnerController.getAllPartners.bind(partnerController));
router.get(
  "/cgc/:cgc",
  partnerController.getPartnerByCgc.bind(partnerController)
);
router.get(
  "/cidade-estado",
  partnerController.getCidadeEstado.bind(partnerController)
);
router.get("/:id", partnerController.getPartnerById.bind(partnerController));
router.post("/", partnerController.createPartner.bind(partnerController));
router.put("/:id", partnerController.updatePartner.bind(partnerController));
router.delete("/:id", partnerController.deletePartner.bind(partnerController));

module.exports = router;
