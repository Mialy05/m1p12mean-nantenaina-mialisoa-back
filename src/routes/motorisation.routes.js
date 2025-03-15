const Motorisation = require("../models/Motorisation");
const MotorisationController = require("../modules/motorisation/controllers/MotorisationController");

const router = require("express").Router();

router.get("/", MotorisationController.findAll);

module.exports = router;
