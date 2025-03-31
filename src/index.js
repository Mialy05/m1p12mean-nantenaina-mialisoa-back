const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const loggerMiddleware = require("./shared/middlewares/logger.middleware.js");
const RendezVous = require("./models/RendezVous.js");
const DevisController = require("./modules/devis/controllers/DevisController.js");
const { authMiddleware } = require("./shared/middlewares/auth.middleware.js");

require("dotenv").configDotenv();
const PORT = process.env.PORT || 5555;

const app = express();
mongoose.set("debug", true);
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use("/test", require("./routes/test"));
app.use("/auth", require("./routes/auth.routes.js"));

app.use("/devis", authMiddleware, require("./routes/devis.routes.js"));
app.use("/motorisations", require("./routes/motorisation.routes.js"));
app.use("/marques", require("./routes/marque.routes.js"));
app.use("/vehicules", require("./routes/vehicule.routes.js"));
app.use("/services", require("./routes/service.routes.js"));
app.use("/rdv", require("./routes/rdv.routes.js"));
app.use(
  "/interventions",
  authMiddleware,
  require("./routes/intervention.routes.js")
);
app.use("/utilisateurs", require("./routes/utilisateur.routes.js"));
app.use("/factures", require("./routes/facture.routes.js"));

app.use("/mock/rdv", async (req, res) => {
  const rdv = await RendezVous.find().populate("devis");
  console.log(rdv);
  res.json(rdv);
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(PORT, () => {
      console.log("server is running on port " + PORT);
    });
  })
  .catch((err) => console.log(err));
