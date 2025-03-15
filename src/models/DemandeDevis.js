const mongoose = require("mongoose");

const demandeDevisSchema = new mongoose.Schema({
  vehiculeId: {
    type: String,
    ref: "Vehicule",
    required: false,
  },
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
});

module.exports = mongoose.model("DemandeDevis", demandeDevisSchema);
