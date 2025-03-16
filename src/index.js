const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authMiddleware = require("./shared/middlewares/auth.middleware.js");

require("dotenv").configDotenv();
const PORT = process.env.PORT || 5555;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/test", require("./routes/test"));
app.use("/auth", require("./routes/auth.routes.js"));

app.use("/devis", authMiddleware, require("./routes/devis.routes.js"));
app.use("/motorisations", require("./routes/motorisation.routes.js"));
app.use("/marques", require("./routes/marque.routes.js"));
app.use("/vehicules", require("./routes/vehicule.routes.js"));

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
