const dayjs = require("dayjs");
const RendezVous = require("../../../models/RendezVous");
const Devis = require("../../../models/Devis");
const ApiResponse = require("../../../shared/types/ApiResponse");
const Intervention = require("../../../models/Intervention");
const Tache = require("../../../models/Tache");
const mongoose = require("mongoose");

class RdvController {
  static async createDemandeRdv(req, res) {
    try {
      const rdv = new RendezVous();
      rdv.devis = req.body.idDevis;
      rdv.dateCreation = dayjs();
      await rdv.save();
      res.json(ApiResponse.success(rdv, "Rendez-vous créé avec succès"));
    } catch (error) {
      console.error(error);
      res.json(
        ApiResponse.error("Erreur lors de la création du rendez-vous", error)
      );
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
      res.json(
        ApiResponse.error("Erreur lors de l'acceptation du rendez-vous", error)
      );
    } finally {
      await session.endSession();
    }
  }
}

module.exports = RdvController;
