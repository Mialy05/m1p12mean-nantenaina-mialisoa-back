const dayjs = require("dayjs");
const RendezVous = require("../../../models/RendezVous");
const Devis = require("../../../models/Devis");
const ApiResponse = require("../../../shared/types/ApiResponse");
const Intervention = require("../../../models/Intervention");
const Tache = require("../../../models/Tache");
const mongoose = require("mongoose");
const { DEVIS_WAIT_RDV } = require("../../../shared/constants/constant");
const {
  findAllRdv,
  findAllDemandeRdv,
  findAllAcceptedRdv,
  createRdv,
  acceptRdvService,
  planifyRdv,
} = require("../services/rdv.service");
const {
  findAllDemandeDevis,
} = require("../../devis/controllers/DevisController");

class RdvController {
  static async createDemandeRdv(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const idDevis = req.body.idDevis;
    if (!idDevis) {
      res.status(400).json(ApiResponse.error("Devis introuvable"));
      return;
    }
    try {
      await createRdv(idDevis, session);
      await session.commitTransaction();
      res.json(ApiResponse.success(rdv, "Rendez-vous créé avec succès"));
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      if (error.message === "Devis introuvable") {
        res.status(400).json(ApiResponse.error("Devis introuvable"));
        return;
      }
      if (error.message === "Devis déjà validé") {
        res.status(400).json(ApiResponse.error("Devis déjà validé"));
        return;
      }
      res.json(
        ApiResponse.error("Erreur lors de la création du rendez-vous", error)
      );
    } finally {
      await session.endSession();
    }
  }

  static async acceptRdv(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await acceptRdvService(req.params.idRdv, req.body.dateAccept, session);

      await session.commitTransaction();
      // await session.abortTransaction();

      res.json(ApiResponse.success(rdv, "Rendez-vous accepté avec succès"));
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      if (error.message === "Rendez-vous introuvable") {
        res.status(400).json(ApiResponse.error("Rendez-vous introuvable"));
        return;
      }
      res
        .status(500)
        .json(
          ApiResponse.error(
            "Erreur lors de l'acceptation du rendez-vous",
            error
          )
        );
    } finally {
      await session.endSession();
    }
  }

  static async getAllDemandeRdv(req, res) {
    try {
      const data = await findAllDemandeRdv();
      res.json(ApiResponse.success(data, "Rendez-vous récupérés avec succès"));
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json(
          ApiResponse.error("Erreur lors de la récupération des RDV", error)
        );
    }
  }
  static async getAllAcceptedRdv(req, res) {
    try {
      const startDate = req.query.startDate
        ? dayjs(req.query.startDate, "YYYY-MM-DD")
        : dayjs().startOf("year");
      const endDate = req.query.endDate
        ? dayjs(req.query.endDate, "YYYY-MM-DD")
        : dayjs().endOf("year");
      console.log(startDate.toISOString(), endDate.toISOString());
      const data = await findAllAcceptedRdv(startDate, endDate);
      res.json(ApiResponse.success(data, "Rendez-vous récupérés avec succès"));
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json(
          ApiResponse.error("Erreur lors de la récupération des RDV", error)
        );
    }
  }

  static async planifyRdvHandler(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const idDevis = req.body.idDevis;
      const dateAccept = req.body.date;

      await planifyRdv(dateAccept, idDevis, session);
      await session.commitTransaction();
      res.json(ApiResponse.success(null, "Rendez-vous planifié avec succès"));
    } catch (error) {
      await session.abortTransaction();
      console.error(error);
      if (error.message === "Rendez-vous introuvable") {
        res.status(400).json(ApiResponse.error("Rendez-vous introuvable"));
        return;
      }
      if (error.message === "Devis introuvable") {
        res.status(400).json(ApiResponse.error("Devis introuvable"));
        return;
      }
      if (error.message === "Devis déjà validé") {
        res.status(400).json(ApiResponse.error("Devis déjà validé"));
        return;
      }
      res
        .status(500)
        .json(
          ApiResponse.error(
            "Erreur lors de la planification du rendez-vous",
            error
          )
        );
    }
  }
}

module.exports = RdvController;
