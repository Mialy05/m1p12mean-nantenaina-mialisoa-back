const { generateJWTToken } = require("../services/auth.service");

class AuthController {
  static generateJWTTest(req, res) {
    const fakeToken = generateJWTToken();
    res.send({ fake: fakeToken });
  }
}

module.exports = AuthController;
