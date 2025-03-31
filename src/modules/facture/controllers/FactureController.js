const Facture = require("../../../models/Facture");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  createFacture,
  findAllFactures,
  generateFacturePDF,
  generateStreamFacturePDF,
} = require("../services/facture.service");

class FactureController {
  static async createFacture(req, res) {
    try {
      const facture = await createFacture(req.body);
      return res.status(201).json(facture);
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: error.message });
    }
  }

  static async getAllFactures(req, res) {
    const { userRole, userId } = req;
    const { page = 1, limit = 10 } = req.query;
    try {
      const data = await findAllFactures(
        userRole,
        userId,
        Number(page),
        Number(limit)
      );
      return res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      return res.status(500).json(ApiResponse.error(error.message));
    }
  }

  /**
   * Téléchargement du PDF d'une facture
   * @param {Request} req
   * @param {Response} res
   */
  static async downloadFacturePDF(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(ApiResponse.error("ID de facture requis"));
      }

      //   const facture = await Facture.findById(id);

      const doc = await generateStreamFacturePDF(id);

      // Définir les en-têtes pour le téléchargement
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=facture-${id}.pdf`
      );

      // Envoyer le PDF au client
      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);

      // Si l'erreur est liée à une facture non trouvée, renvoyer 404
      if (error.message === "Facture introuvable") {
        return res
          .status(404)
          .json(ApiResponse.error("Facture introuvable", error.message));
      }

      // Autres erreurs
      return res
        .status(500)
        .json(
          ApiResponse.error(
            "Erreur lors de la génération du PDF",
            error.message
          )
        );
    }
  }
}

module.exports = FactureController;
