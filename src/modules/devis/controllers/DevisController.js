const DemandeDevis = require("./../../../models/DemandeDevis");

class DevisController {
  static async createDemandeDevis(req, res) {
    const demande = new DemandeDevis(req.body);
    await demande.save();

    res.json({ message: "Demande de devis créée" });
  }

  static async findAllDemandeDevis(req, res) {
    const demandes = await DemandeDevis.find();
    res.json(demandes);
  }
}

module.exports = DevisController;
