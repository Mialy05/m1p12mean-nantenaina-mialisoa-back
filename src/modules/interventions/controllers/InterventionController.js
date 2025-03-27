const { PAGINATION_ROW } = require("../../../shared/constants/constant");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  findAllInterventions,
  findInterventionById,
  assignTacheToResponsable,
} = require("../services/intervention.service");

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

    // if (req.query.userRole === UTILISATEUR_ROLES.client) {
    //   filter["utilisateur.id"] = req.query.userId;
    // } else if (req.query.userRole === UTILISATEUR_ROLES.manager && userId) {
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
        parseInt(limit) || PAGINATION_ROW,
        req.query.userRole,
        req.query.userId
      );
      res.json(ApiResponse.success(interventions));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async findById(req, res) {
    const { id } = req.params;
    const { userRole } = req.query;

    try {
      const intervention = await findInterventionById(id, userRole);
      if (intervention) {
        res.json(ApiResponse.success(intervention));
      } else {
        res.status(422).json(ApiResponse.error(`Intervention non trouvée`));
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async assignTask(req, res) {
    const { id } = req.params;
    const { responsables } = req.body;
    try {
      await assignTacheToResponsable(id, responsables);
      res.json(ApiResponse.success("Tâche assignée."));
    } catch (error) {
      if (error.cause == 404) {
        res.status(422).json(ApiResponse.error("Tâche non trouvée."));
      } else {
        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }
}

module.exports = InterventionController;
