const router = require("express").Router();
const RdvController = require("../modules/rdv/controllers/RdvController");

router.post("/", RdvController.createDemandeRdv);
router.get("/demandes", RdvController.getAllDemandeRdv);
router.get("/accepted", RdvController.getAllAcceptedRdv);
router.post("/planify", RdvController.planifyRdvHandler);
router.post("/:id/accept", RdvController.acceptRdv);

module.exports = router;
