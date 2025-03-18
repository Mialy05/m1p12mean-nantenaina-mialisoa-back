const router = require("express").Router();
const RdvController = require("../modules/rdv/controllers/RdvController");

router.post("/", RdvController.createDemandeRdv);
router.post("/:id/accept", RdvController.acceptRdv);

module.exports = router;
