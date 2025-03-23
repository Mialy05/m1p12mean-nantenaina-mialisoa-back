const jwt = require("jsonwebtoken");
const Utilisateur = require("../../../models/Utilisateur");
const { UTILISATEUR_STATUS } = require("../constant/utilisateur.constant");
require("dotenv").configDotenv();

const secretKey = process.env.JWT_SECRET;
console.log(secretKey, "******");

const generateJWTToken = () => {
  const userData = {
    id: "67d6c7d3c34d5a3c68c2f570",
    role: "CLI",
  };

  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(userData, secretKey, options);
};

const findUtilisateurById = async (id) => {
  const utilisateur = await Utilisateur.findOne({
    _id: id,
    status: UTILISATEUR_STATUS.active,
  });
  return utilisateur;
};

module.exports = { generateJWTToken, findUtilisateurById };
