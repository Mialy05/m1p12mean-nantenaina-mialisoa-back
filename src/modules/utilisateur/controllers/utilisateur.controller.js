const ApiResponse = require("../../../shared/types/ApiResponse");
const { findAllUtilisateurs } = require("../services/utilisateur.service");

class UtilisateurController {
  static async findAll(req, res) {
    const { roles } = req.query;

    try {
      const utilisateurs = await findAllUtilisateurs(roles);
      res.json(ApiResponse.success(utilisateurs));
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json(ApiResponse.error(error.message || `Une erreur s'est produite`));
    }
  }
}

module.exports = UtilisateurController;
