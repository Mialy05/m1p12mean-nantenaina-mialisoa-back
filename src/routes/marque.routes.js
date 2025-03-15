const router = require("express").Router();
const MarqueController = require("../modules/marque/controllers/MarqueController");

router.get("/", MarqueController.findAll);

module.exports = router;
