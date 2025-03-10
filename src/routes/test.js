const testController = require("../shared/controllers/test.controller");

const router = require("express").Router();

router.get("/", testController.testApi);

module.exports = router;
