const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").configDotenv();
const PORT = process.env.PORT || 5555;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/test", require("./routes/test"));

app.use("/devis", require("./routes/devis.routes.js"));

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
