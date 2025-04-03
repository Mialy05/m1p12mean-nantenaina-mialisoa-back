const jwt = require("jsonwebtoken");
const Utilisateur = require("../../../models/Utilisateur");
const {
  UTILISATEUR_STATUS,
  UTILISATEUR_ROLES,
} = require("../constant/utilisateur.constant");
require("dotenv").configDotenv();
const bcrypt = require("bcrypt");

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

const comparePwd = async (textPwd, hashedPwd) => {
  return await bcrypt.compare(textPwd, hashedPwd);
};

const loginService = async (email, pwd) => {
  const utilisateur = await Utilisateur.findOne({
    email,
    status: UTILISATEUR_STATUS.active,
    role: UTILISATEUR_ROLES.client,
  });
  if (utilisateur && (await comparePwd(pwd, utilisateur.pwd))) {
    const token = generateJWTToken(utilisateur);
    return { token };
  }
  throw new Error("Email ou mot de passe incorrect");
};

const loginBOService = async (email, pwd) => {
  const utilisateur = await Utilisateur.findOne({
    $and: [
      { email, status: UTILISATEUR_STATUS.active },
      {
        $or: [
          { role: UTILISATEUR_ROLES.manager },
          { role: UTILISATEUR_ROLES.mecanicien },
        ],
      },
    ],
  });

  if (utilisateur && (await comparePwd(pwd, utilisateur.pwd))) {
    const token = generateJWTToken(utilisateur);
    return { token };
  }
  throw new Error("Email ou mot de passe incorrect");
};

module.exports = {
  generateJWTTokenRole,
  findUtilisateurById,
  loginService,
  loginBOService,
};
