const mongoose = require("mongoose");

const vehiculeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  marque: {
    type: String,
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
  kilometrage: {
    type: Number,
    required: true,
  },
  motorisation: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Vehicule", vehiculeSchema);
