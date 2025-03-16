const router = require("express").Router();
const VehiculeController = require("../modules/vehicules/controllers/VehiculeController");

router.get("/", VehiculeController.findAll);

module.exports = router;
