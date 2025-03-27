const jwt = require("jsonwebtoken");
const Utilisateur = require("../../../models/Utilisateur");
const {
  UTILISATEUR_STATUS,
  UTILISATEUR_ROLES,
} = require("../constant/utilisateur.constant");
require("dotenv").configDotenv();

const secretKey = process.env.JWT_SECRET;

const generateJWTTokenRole = (role = UTILISATEUR_ROLES.client) => {
  const userData = {
    id: "67d6c7d3c34d5a3c68c2f570",
    role: role,
    nom: "Rakoto",
    prenom: "Hervé",
    email: "mialisoamurielle@gmail.com",
    telephone: "0321122233",
  };

  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(userData, secretKey, options);
};

const generateJWTToken = (utilisateur) => {
  const userData = {
    id: utilisateur._id,
    role: utilisateur.role,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    email: utilisateur.email,
    telephone: utilisateur.telephone,
  };

  const options = {
    expiresIn: "2d",
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

const loginService = async (email, pwd) => {
  const utilisateur = await Utilisateur.findOne({
    email,
    pwd,
    status: UTILISATEUR_STATUS.active,
  });
  if (utilisateur) {
    const token = generateJWTToken(utilisateur);
    return { token };
  }
  throw new Error("Utilisateur non trouvé");
};

module.exports = { generateJWTTokenRole, findUtilisateurById, loginService };
