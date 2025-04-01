const { PAGINATION_ROW } = require("../../../shared/constants/constant");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  findAllUtilisateurs,
  findAllPaginatedMecano,
  findAllTacheOfUtilisateur,
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
}

module.exports = UtilisateurController;
