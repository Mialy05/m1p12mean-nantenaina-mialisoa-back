const { UTILISATEUR_ROLES } = require("../constant/utilisateur.constant");
const { generateJWTToken } = require("../services/auth.service");

class AuthController {
  static generateJWTTest(req, res) {
    const fakeToken = generateJWTToken();
    res.send({ fake: fakeToken });
  }

  static generateJWTTestManager(req, res) {
    const fakeToken = generateJWTToken(UTILISATEUR_ROLES.manager);
    res.send({ fake: fakeToken });
  }
}

module.exports = AuthController;
