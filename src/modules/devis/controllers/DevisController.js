const Vehicule = require("../../../models/Vehicule");
const { findUtilisateurById } = require("../../auth/services/auth.service");
const {
  findVehiculeById,
} = require("../../vehicules/services/vehicule.service");
const DemandeDevis = require("./../../../models/DemandeDevis");
const dayjs = require("dayjs");

class DevisController {
  static async createDemandeDevis(req, res) {
    const annee = dayjs(req.body.vehicule.annee);
    req.body.vehicule.annee = annee.get("year");
    const demande = new DemandeDevis(req.body);
    demande.status = 0;

    demande.dateDemande = new Date();

    if (req.body.saveVehicule) {
      const vehicule = new Vehicule(req.body.vehicule);
      await vehicule.save();
      demande.vehiculeId = vehicule;
    }

    if (demande.vehiculeId) {
      const vehicule = await findVehiculeById(demande.vehiculeId);
      demande.vehicule = vehicule;
      demande.vehicule.marque = vehicule.marque.nom;
      demande.vehicule.motorisation = vehicule.motorisation.nom;
    }

    const utilisateur = await findUtilisateurById(req.userId);
    if (utilisateur) {
      demande.utilisateur = {};
      demande.utilisateur.id = utilisateur.id;
      demande.utilisateur.nom = utilisateur.nom;
      demande.utilisateur.prenom = utilisateur.prenom;

      demande.vehiculeId = undefined;
      console.log("demande", demande);

      await demande.save();

      res.json({ message: "Demande de devis créée" });
    } else {
      res.status(403).json({ isError: true, message: "Utilisateur invalide" });
    }
  }

  static async findAllDemandeDevis(req, res) {
    const demandes = await DemandeDevis.find().populate({
      path: "vehicule",
      populate: [
        {
          path: "marque",
          model: "Marque",
        },
        {
          path: "motorisation",
          model: "Motorisation",
        },
      ],
    });
    res.json(demandes);
  }
  // static async findAllVehicule(req, res) {
  //   const demandes = await Vehicule.find()
  //     .populate("marque")
  //     .populate("motorisation");
  //   res.json(demandes);
  // }
}

module.exports = DevisController;
