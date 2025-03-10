const express = require("express");
const cors = require("cors");

require("dotenv").configDotenv();
const PORT = process.env.PORT || 5555;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/test", require("./routes/test"));

app.listen(PORT, () => {
  console.log("server is running");
});
