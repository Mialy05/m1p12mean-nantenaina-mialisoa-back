const { default: mongoose } = require("mongoose");
const {
  PAGINATION_ROW,
  TACHE_DELETED_STATUS,
  CAUSE_ERROR,
  TACHE_STATUS,
} = require("../../../shared/constants/constant");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const {
  findAllInterventions,
  findInterventionById,
  assignTacheToResponsable,
  deleteTache,
  updateTacheStatus,
  findTachesByIdIntervention,
  addTaskToIntervention,
  findServicesInIntervention,
  findAllCommentsByIdTache,
  addCommentToTache,
} = require("../services/intervention.service");
const Utilisateur = require("../../../models/Utilisateur");

class InterventionController {
  static async findAll(req, res) {
    const {
      userId,
      page = 1,
      limit = PAGINATION_ROW,
      userRole,
      nom = "",
      immatriculation = "",
    } = req.query;

    const user = await Utilisateur.findOne({ _id: userId });

    if (!user) {
      res.status(422).json(ApiResponse.error("Utilisateur non trouvé."));
      return;
    }

    const filter = {
      "vehicule.immatriculation": {
        $regex: `(?=.*${immatriculation})`,
        $options: "i",
      },
    };

    if (req.query.userRole === UTILISATEUR_ROLES.client) {
      filter["client.email"] = user.email;
    }

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
        userId,
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
      if (error.cause == CAUSE_ERROR.notFound) {
        res.status(422).json(ApiResponse.error("Intervention non trouvée."));
      } else {
        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }
  static async addTache(req, res) {
    try {
      const { id: idIntervention } = req.params;
      const { heure, responsables, service } = req.body;
      console.log(idIntervention, heure, responsables, service);

      const intervention = await addTaskToIntervention({
        idIntervention,
        heure,
        responsables,
        service,
      });

      res.json(ApiResponse.success(intervention));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async getServicesInIntervention(req, res) {
    const { id } = req.params;
    try {
      const services = await findServicesInIntervention(id);
      const intervention = await findInterventionById(id, req.query.userRole);
      intervention.taches = [];
      intervention.services = services;
      res.json(ApiResponse.success(intervention));
    } catch (error) {
      if (error.cause == 404) {
        res.status(422).json(ApiResponse.error("Intervention non trouvée."));
      } else {
        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }

  static async findCommentsOfTache(req, res) {
    const { id } = req.params;
    try {
      const taches = await findAllCommentsByIdTache(id);
      res.json(ApiResponse.success(taches));
    } catch (error) {
      if (error.cause == CAUSE_ERROR.notFound) {
        res.status(422).json(ApiResponse.error("Tâche non trouvée."));
      } else {
        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }

  static async commentTask(req, res) {
    const { id } = req.params;
    const { contenu } = req.body;
    const userId = req.query.userId;

    console.log(req.query);

    try {
      await addCommentToTache(id, { contenu: contenu }, userId);
      res.json(ApiResponse.success({}, `Commentaire ajouté`));
    } catch (error) {
      // TODO: atao anaty middleware de réponse
      if (error.cause == CAUSE_ERROR.notFound) {
        res.status(422).json(ApiResponse.error("Tâche non trouvée."));
      } else if (error.cause == CAUSE_ERROR.forbidden) {
        res
          .status(403)
          .json(ApiResponse.error(error.message || "Action interdite"));
      } else {
        res.status(500).json(ApiResponse.error(error.message));
      }
    }
  }
}

module.exports = InterventionController;
