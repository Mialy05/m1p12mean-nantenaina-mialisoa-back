const AuthController = require("../modules/auth/controllers/AuthController");

const router = require("express").Router();

router.get("/test", AuthController.generateJWTTest);
router.get("/manager", AuthController.generateJWTTestManager);

module.exports = router;
