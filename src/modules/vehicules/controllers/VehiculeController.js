const Vehicule = require("../../../models/Vehicule");
const { findAllVehicule } = require("../services/vehicule.service");

class VehiculeController {
  static async findAll(req, res) {
    try {
      const vehicules = await findAllVehicule();
      res.json(vehicules);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des véhicules" });
    }
  }
}

module.exports = VehiculeController;
