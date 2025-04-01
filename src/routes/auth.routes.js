const AuthController = require("../modules/auth/controllers/AuthController");

const router = require("express").Router();

router.get("/test", AuthController.generateJWTTest);
router.get("/manager", AuthController.generateJWTTestManager);
router.get("/meca", AuthController.generateJWTTestMeca);
router.post("/login", AuthController.login);
router.post("/bo/login", AuthController.loginBO);

module.exports = router;
