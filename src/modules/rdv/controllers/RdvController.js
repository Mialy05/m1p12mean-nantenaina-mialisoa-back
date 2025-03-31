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
      const devis = await Devis.findOne({ _id: idDevis });
      if (!devis) {
        res.status(400).json(ApiResponse.error("Devis introuvable"));
        return;
      }
      if (devis.status !== 0) {
        res.status(400).json(ApiResponse.error("Devis déjà validé"));
        return;
      }
      devis.status = DEVIS_WAIT_RDV;
      await devis.save({ session });

      const rdv = new RendezVous();
      rdv.devis = idDevis;
      rdv.dateCreation = dayjs();
      await rdv.save({ session });

      await session.commitTransaction();
      res.json(ApiResponse.success(rdv, "Rendez-vous créé avec succès"));
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
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
      const idRdv = req.params.id;
      const rdv = await RendezVous.findOne({ _id: idRdv });
      if (!rdv) {
        res.json(ApiResponse.error("Rendez-vous introuvable"));
        return;
      }
      const idDevis = rdv.devis;
      rdv.status = 10;
      rdv.date = dayjs(req.body.date);

      const devis = await Devis.findOne({ _id: idDevis });
      devis.status = 10;
      await devis.save({ session });

      const intervention = new Intervention();
      intervention.vehicule = devis.vehicule;
      intervention.client = devis.client;
      intervention.date = rdv.date;
      const idIntervention = await intervention.save({ session });

      for (const service of devis.services) {
        const tache = new Tache();

        tache.nom = service.nom;
        tache.estimation = service.heures;
        tache.intervention = idIntervention;

        await tache.save({ session });
      }

      await rdv.save({ session });

      await session.commitTransaction();
      // await session.abortTransaction();

      res.json(ApiResponse.success(rdv, "Rendez-vous accepté avec succès"));
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
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
}

module.exports = RdvController;
