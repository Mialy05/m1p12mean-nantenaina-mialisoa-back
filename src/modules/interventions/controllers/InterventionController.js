const { PAGINATION_ROW } = require("../../../shared/constants/constant");
const ApiResponse = require("../../../shared/types/ApiResponse");
const { findAllInterventions } = require("../services/intervention.service");

class InterventionController {
  static async findAll(req, res) {
    const {
      page = 1,
      limit = PAGINATION_ROW,
      userRole,
      nom = "",
      immatriculation = "",
    } = req.query;

    const filter = {
      "vehicule.immatriculation": {
        $regex: `(?=.*${immatriculation})`,
        $options: "i",
      },
    };

    // if (req.userRole === UTILISATEUR_ROLES.client) {
    //   filter["utilisateur.id"] = req.userId;
    // } else if (req.userRole === UTILISATEUR_ROLES.manager && userId) {
    //   filter["utilisateur.id"] = userId;
    // }

    const nomParts = nom.split(/\s+/).filter((part) => part.trim() !== "");
    const searchRegex = nomParts.map((part) => `(?=.*${part})`).join("");

    const finalFilter = {
      $and: [
        filter,
        {
          $or: [
            { "client.nom": { $regex: searchRegex, $options: "i" } },
            { "client.prenom": { $regex: searchRegex, $options: "i" } },
          ],
        },
      ],
    };

    try {
      const interventions = await findAllInterventions(
        userRole,
        finalFilter,
        parseInt(page) || 1,
        parseInt(limit) || PAGINATION_ROW
      );
      res.json(ApiResponse.success(interventions));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
}

module.exports = InterventionController;
