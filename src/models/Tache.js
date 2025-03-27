const mongoose = require("mongoose");
const tacheSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  status: {
    type: Number,
    required: true,
    default: 0,
  },
  estimation: {
    type: Number,
    required: true,
  },
  intervention: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Intervention",
    required: true,
  },
  responsables: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: false,
    },
  ],
});

module.exports = mongoose.model("Tache", tacheSchema);
