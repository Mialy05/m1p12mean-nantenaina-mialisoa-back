const InterventionController = require("../modules/interventions/controllers/InterventionController");

const router = require("express").Router();
// TODO: manager sy meca ihany
router.get("/", InterventionController.findAll);
// TODO: manager sy meca ihany
router.get("/:id", InterventionController.findById);

module.exports = router;
