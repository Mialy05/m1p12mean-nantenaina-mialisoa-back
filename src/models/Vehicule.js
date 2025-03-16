const mongoose = require("mongoose");

const vehiculeSchema = new mongoose.Schema({
  marque: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Marque",
    required: true,
  },
  modele: {
    type: String,
    required: true,
  },
  annee: {
    type: Number,
    required: true,
  },
  motorisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Motorisation",
    required: true,
  },
  immatriculation: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Vehicule", vehiculeSchema);
