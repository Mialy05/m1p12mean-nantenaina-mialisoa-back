const mongoose = require("mongoose");
const dayjs = require("dayjs");

const {
  UTILISATEUR_STATUS,
} = require("../modules/auth/constant/utilisateur.constant");

const utilisateurSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pwd: {
    type: String,
    required: true,
    trim: true,
  },
  nom: {
    type: String,
    required: true,
    index: true,
  },
  prenom: {
    type: String,
    required: false,
    index: true,
  },
  role: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: UTILISATEUR_STATUS.active,
    index: true,
  },
  inscriptionDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Utilisateur", utilisateurSchema);
