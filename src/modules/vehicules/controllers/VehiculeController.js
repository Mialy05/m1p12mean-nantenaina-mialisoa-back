const Vehicule = require("../../../models/Vehicule");
const { CAUSE_ERROR } = require("../../../shared/constants/constant");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const {
  findAllVehicule,
  findVehiculeOfUser,
} = require("../services/vehicule.service");

class VehiculeController {
  static async findAll(req, res) {
    const { userRole, userEmail } = req.query;
    try {
      let vehicules = [];
      if (userRole === UTILISATEUR_ROLES.client) {
        if (!userEmail) {
          return res
            .status(CAUSE_ERROR.badRequest)
            .json(ApiResponse.error(`Email invalide`));
        } else {
          vehicules = await findVehiculeOfUser(userEmail);
        }
      } else {
        vehicules = await findAllVehicule();
      }
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
