const mongoose = require("mongoose");
const factureSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  ref: {
    type: String,
    required: true,
  },
  montant: {
    type: Number,
    required: true,
  },
  client: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
    },
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
  vehicule: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicule",
    },
    marque: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Marque",
      },
      nom: {
        type: String,
        required: true,
      },
    },
    motorisation: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Motorisation",
      },
      nom: {
        type: String,
        required: true,
      },
    },
    modele: {
      type: String,
      required: true,
    },
    immatriculation: {
      type: String,
      required: true,
    },
  },
  remise: {
    type: Number,
    required: true,
    default: 0,
  },
  details: [
    {
      idService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
      designation: {
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
      remise: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model("Facture", factureSchema);
