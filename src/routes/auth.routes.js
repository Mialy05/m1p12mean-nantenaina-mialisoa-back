const AuthController = require("../modules/auth/controllers/AuthController");

const router = require("express").Router();

router.get("/test", AuthController.generateJWTTest);

module.exports = router;
