const mongoose = require("mongoose");
const marqueSchema = mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Marque", marqueSchema);
