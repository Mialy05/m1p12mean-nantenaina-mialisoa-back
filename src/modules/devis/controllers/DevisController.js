const Vehicule = require("../../../models/Vehicule");
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

    await demande.save();

    res.json({ message: "Demande de devis créée" });
  }

  static async findAllDemandeDevis(req, res) {
    const demandes = await DemandeDevis.find();
    res.json(demandes);
  }
}

module.exports = DevisController;
