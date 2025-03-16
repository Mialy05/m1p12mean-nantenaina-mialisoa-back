const Vehicule = require("../../../models/Vehicule");

const findAllVehicule = async () => {
  const vehicules = await Vehicule.find()
    .populate("marque")
    .populate("motorisation");
  return vehicules;
};
const findVehiculeById = async (id) => {
  const vehicules = await Vehicule.findOne({ _id: id })
    .populate("marque")
    .populate("motorisation");
  return vehicules;
};

module.exports = {
  findAllVehicule,
  findVehiculeById,
};
