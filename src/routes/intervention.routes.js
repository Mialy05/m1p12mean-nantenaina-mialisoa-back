const InterventionController = require("../modules/interventions/controllers/InterventionController");

const router = require("express").Router();
// TODO: manager sy meca ihany
router.get("/", InterventionController.findAll);

module.exports = router;
