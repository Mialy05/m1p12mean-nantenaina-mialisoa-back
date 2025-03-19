const router = require("express").Router();
const DemandeDevisController = require("../modules/devis/controllers/DevisController");

router.post("/demandes", DemandeDevisController.createDemandeDevis);
router.post("/", DemandeDevisController.createDevis);
router.get("/demandes", DemandeDevisController.findAllDemandeDevis);
router.get("/", DemandeDevisController.findAllDevis);
router.get("/:id", DemandeDevisController.findDevisById);

// router.get("/vehicules", DemandeDevisController.findAllVehicule);

module.exports = router;
