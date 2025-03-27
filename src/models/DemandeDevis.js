const mongoose = require("mongoose");

const demandeDevisSchema = new mongoose.Schema({
  vehicule: {
    type: Object,
    required: false,
  },
  dateDemande: {
    type: Date,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  saveVehicule: {
    type: Boolean,
    required: false,
  },
  status: {
    type: Number,
    required: true,
  },
  kilometrage: {
    type: Number,
    required: true,
  },
  utilisateur: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("DemandeDevis", demandeDevisSchema);
