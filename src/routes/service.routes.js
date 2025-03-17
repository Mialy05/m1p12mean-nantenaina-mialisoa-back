const router = require("express").Router();
const ServiceController = require("../modules/service/controllers/ServiceController");

router.get("/", ServiceController.findAll);

module.exports = router;
