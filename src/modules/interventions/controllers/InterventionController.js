const {
  PAGINATION_ROW,
  TACHE_DELETED_STATUS,
  CAUSE_ERROR,
  TACHE_STATUS,
} = require("../../../shared/constants/constant");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  findAllInterventions,
  findInterventionById,
  assignTacheToResponsable,
  deleteTache,
  updateTacheStatus,
  findTachesByIdIntervention,
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
      res.json(ApiResponse.success({}, "Tâche assignée."));
    } catch (error) {
      if (error.cause == 404) {
        res.status(422).json(ApiResponse.error("Tâche non trouvée."));
      } else {
        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }

  static async deleteTask(req, res) {
    const { id } = req.params;
    try {
      await updateTacheStatus(id, TACHE_DELETED_STATUS);
      res.json(ApiResponse.success({}, "Tâche supprimée."));
    } catch (error) {
      if (error.cause == CAUSE_ERROR.notFound) {
        res.status(422).json(ApiResponse.error("Tâche non trouvée."));
      } else if (error.cause == CAUSE_ERROR.validationError) {
        res
          .status(422)
          .json(ApiResponse.error(error.message || "Donnée invalide"));
      } else if (error.cause == CAUSE_ERROR.forbidden) {
        res
          .status(403)
          .json(ApiResponse.error(error.message || "Action interdite"));
      } else {
        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }

  static async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      await updateTacheStatus(id, status);
      res.json(
        ApiResponse.success({}, `Tâche déplacée vers ${TACHE_STATUS[status]}`)
      );
    } catch (error) {
      if (error.cause == CAUSE_ERROR.notFound) {
        res.status(422).json(ApiResponse.error("Tâche non trouvée."));
      } else if (error.cause == CAUSE_ERROR.validationError) {
        res
          .status(422)
          .json(ApiResponse.error(error.message || "Donnée invalide"));
      } else if (error.cause == CAUSE_ERROR.forbidden) {
        res
          .status(403)
          .json(ApiResponse.error(error.message || "Action interdite"));
      } else {
        console.log(error);

        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }

  static async findAllTaches(req, res) {
    const { id } = req.params;
    try {
      const taches = await findTachesByIdIntervention(id);
      res.json(ApiResponse.success(taches));
    } catch (error) {
      if (error.cause == 404) {
        res.status(422).json(ApiResponse.error("Intervention non trouvée."));
      } else {
        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }
}

module.exports = InterventionController;
