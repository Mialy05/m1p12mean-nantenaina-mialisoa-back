const Marque = require("../../../models/Marque");

const findAllMarque = async () => {
  return Marque.find();
};

module.exports = {
  findAllMarque,
};
