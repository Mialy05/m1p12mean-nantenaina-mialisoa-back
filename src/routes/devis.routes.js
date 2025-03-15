const router = require("express").Router();
const DemandeDevisController = require("../modules/devis/controllers/DevisController");

router.post("/demandes", DemandeDevisController.createDemandeDevis);
router.get("/demandes", DemandeDevisController.findAllDemandeDevis);

module.exports = router;
