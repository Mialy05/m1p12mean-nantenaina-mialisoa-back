const Motorisation = require("../../../models/Motorisation");
const { findAllMotorisation } = require("../services/motorisation.service");

class MotorisationController {
  static async findAll(req, res) {
    const motorisations = await findAllMotorisation();

    res.json(motorisations);
  }
}

module.exports = MotorisationController;
