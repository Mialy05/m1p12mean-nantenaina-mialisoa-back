const mongoose = require("mongoose");

const devisSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
  },
  idDemandeDevis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DemandeDevis",
    required: false,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: 0,
  },
  client: {
    nom: {
      type: String,
      required: true,
    },
    prenom: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  services: [
    {
      nom: {
        type: String,
        required: true,
      },
      prix: {
        type: Number,
        required: true,
      },
      heures: {
        type: Number,
        required: true,
      },
    },
  ],
  vehicule: {
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
    kilometrage: {
      type: Number,
      required: true,
    },
  },
});

module.exports = mongoose.model("Devis", devisSchema);
