const mongoose = require("mongoose");
const RdvSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: false,
  },
  dateCreation: {
    type: Date,
    required: true,
  },
  devis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Devis",
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("RendezVous", RdvSchema);
