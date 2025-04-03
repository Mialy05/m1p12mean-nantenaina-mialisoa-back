const { default: mongoose } = require("mongoose");
const {
  PAGINATION_ROW,
  CAUSE_ERROR,
} = require("../../../shared/constants/constant");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  findAllUtilisateurs,
  findAllPaginatedMecano,
  findAllTacheOfUtilisateur,
  inscriptionClient,
  inscriptionMecanicien,
} = require("../services/utilisateur.service");

class UtilisateurController {
  static async findAll(req, res) {
    const { roles, nom } = req.query;

    try {
      const utilisateurs = await findAllUtilisateurs(roles, nom);
      res.json(ApiResponse.success(utilisateurs));
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json(ApiResponse.error(error.message || `Une erreur s'est produite`));
    }
  }

  static async findAllPaginatedMecano(req, res) {
    const { nom, page = 1, limit = PAGINATION_ROW } = req.query;

    try {
      const mecano = await findAllPaginatedMecano(nom, page, limit);
      res.json(ApiResponse.success(mecano));
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json(ApiResponse.error(error.message || `Une erreur s'est produite`));
    }
  }

  static async findAllTacheOfMecanicien(req, res) {
    const { id } = req.params;
    try {
      const taches = await findAllTacheOfUtilisateur(id);

      return res.json(ApiResponse.success(taches));
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json(ApiResponse.error(error.message || `Une erreur s'est produite`));
    }
  }

  static async inscriptionUser(req, res) {
    const data = req.body;

    try {
      const newUser = await inscriptionClient(data);
      res.status(201).json(ApiResponse.success(newUser, "Utilisateur créé"));
    } catch (error) {
      console.log(error);
      if (error.message == CAUSE_ERROR.badRequest) {
        res
          .status(CAUSE_ERROR.badRequest)
          .json(ApiResponse.error("Données non valides", error.cause));
      } else {
        res
          .status(500)
          .json(
            ApiResponse.error(error.message || "Une erreur s'est produite")
          );
      }
    }
  }

  static async inscriptionMecano(req, res) {
    const data = req.body;

    try {
      const newUser = await inscriptionMecanicien(data);
      res.status(201).json(ApiResponse.success(newUser, "Utilisateur créé"));
    } catch (error) {
      console.log(error);
      if (error.message == CAUSE_ERROR.badRequest) {
        res
          .status(CAUSE_ERROR.badRequest)
          .json(ApiResponse.error("Données non valides", error.cause));
      } else {
        res
          .status(500)
          .json(
            ApiResponse.error(error.message || "Une erreur s'est produite")
          );
      }
    }
  }
}

module.exports = UtilisateurController;
