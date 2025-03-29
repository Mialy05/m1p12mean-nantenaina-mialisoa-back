const InterventionController = require("../modules/interventions/controllers/InterventionController");

const router = require("express").Router();
// TODO: manager sy meca ihany
router.get("/", InterventionController.findAll);
// TODO: manager sy meca ihany
router.get("/:id", InterventionController.findById);

// TODO: manager ihany
router.post("/taches/:id/assign", InterventionController.assignTask);
// TODO: manager ihany
router.delete("/taches/:id", InterventionController.deleteTask);

// TODO: manager sy meca ihany
router.patch("/taches/:id", InterventionController.updateStatus);

module.exports = router;
