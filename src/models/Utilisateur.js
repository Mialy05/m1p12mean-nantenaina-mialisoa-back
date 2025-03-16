const mongoose = require("mongoose");
const {
  UTILISATEUR_STATUS,
} = require("../modules/auth/constant/utilisateur.constant");

const utilisateurSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  pwd: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: UTILISATEUR_STATUS.active,
  },
});

module.exports = mongoose.model("Utilisateur", utilisateurSchema);
