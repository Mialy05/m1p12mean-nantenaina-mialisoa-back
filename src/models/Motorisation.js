const mongoose = require("mongoose");
const motorisationSchema = mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Motorisation", motorisationSchema);
