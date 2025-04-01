const { UTILISATEUR_ROLES } = require("../constant/utilisateur.constant");
const { generateJWTRole, loginBOService } = require("../services/auth.service");
const { loginService } = require("../services/auth.service");
const ApiResponse = require("../../../shared/types/ApiResponse");

class AuthController {
  static generateJWTTest(req, res) {
    const fakeToken = generateJWTRole();
    res.send({ fake: fakeToken });
  }

  static generateJWTTestManager(req, res) {
    const fakeToken = generateJWTRole(UTILISATEUR_ROLES.manager);
    res.send({ fake: fakeToken });
  }
  static generateJWTTestMeca(req, res) {
    const fakeToken = generateJWTRole(UTILISATEUR_ROLES.mecanicien);
    res.send({ fake: fakeToken });
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const token = await loginService(email, password);
      res.json(ApiResponse.success(token));
    } catch (err) {
      res.status(401).json(ApiResponse.error(err.message, 401));
    }
  }

  static async loginBO(req, res) {
    try {
      const { email, password } = req.body;
      const token = await loginBOService(email, password);
      res.json(ApiResponse.success(token));
    } catch (err) {
      res.status(401).json(ApiResponse.error(err.message, 401));
    }
  }
}

module.exports = AuthController;
