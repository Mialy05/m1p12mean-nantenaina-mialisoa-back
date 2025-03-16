const mongoose = require("mongoose");

const demandeDevisSchema = new mongoose.Schema({
  vehiculeId: {
    type: mongoose.Schema.Types.ObjectId,
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
  status: {
    type: Number,
    required: true,
  },
  kilometrage: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("DemandeDevis", demandeDevisSchema);
