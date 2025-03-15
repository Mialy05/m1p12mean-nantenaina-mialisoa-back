const Motorisation = require("../../../models/Motorisation");

const findAllMotorisation = async () => {
  return Motorisation.find();
};

module.exports = {
  findAllMotorisation,
};
