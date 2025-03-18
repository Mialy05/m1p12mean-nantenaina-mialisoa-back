const dayjs = require("dayjs");
const mongoose = require("mongoose");
const interventionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: dayjs(),
  },
  status: {
    type: Number,
    required: true,
    default: 0,
  },
  vehicule: {
    type: Object,
    required: true,
  },
  client: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("Intervention", interventionSchema);
