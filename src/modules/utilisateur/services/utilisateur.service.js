const Utilisateur = require("../../../models/Utilisateur");
const {
  UTILISATEUR_STATUS,
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const {
  PAGINATION_ROW,
  TACHE_DELETED_STATUS,
  TACHE_STATUS,
  CAUSE_ERROR,
} = require("../../../shared/constants/constant");
const Tache = require("../../../models/Tache");
const { default: mongoose } = require("mongoose");
const {
  validateUtilisateurData,
  parseMongoDBError,
} = require("../../../shared/helpers/validation");
const bcrypt = require("bcrypt");

const findAllUtilisateurs = async (roles, nom) => {
  let filter = { $and: [{ status: UTILISATEUR_STATUS.active }] };
  if (nom) {
    const nomParts = nom.split(/\s+/).filter((part) => part.trim() !== "");
    const searchRegex = nomParts.map((part) => `(?=.*${part})`).join("");

    filter = {
      $and: [
        { status: UTILISATEUR_STATUS.active },
        {
          $or: [
            { nom: { $regex: searchRegex, $options: "i" } },
            { prenom: { $regex: searchRegex, $options: "i" } },
          ],
        },
      ],
    };
  }

  if (roles) {
    if (Array.isArray(roles) && roles.length > 0) {
      filter.$and.push({ role: { $in: roles } });
    } else if (!Array.isArray(roles)) {
      filter.$and.push({ role: roles });
    }
  }

  return await Utilisateur.find(filter, { pwd: 0 });
};

const findAllPaginatedMecano = async (
  nom,
  page = 1,
  limit = PAGINATION_ROW
) => {
  let filter = { role: UTILISATEUR_ROLES.mecanicien };
  if (nom) {
    const nomParts = nom.split(/\s+/).filter((part) => part.trim() !== "");
    const searchRegex = nomParts.map((part) => `(?=.*${part})`).join("");

    filter = {
      $and: [
        filter,
        {
          $or: [
            { nom: { $regex: searchRegex, $options: "i" } },
            { prenom: { $regex: searchRegex, $options: "i" } },
          ],
        },
      ],
    };
  }

  const mecano = await Utilisateur.find(filter, { pwd: 0 })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ nom: "asc" });

  const totalCounts = await Utilisateur.countDocuments(filter);

  return {
    items: mecano,
    page,
    limit,
    totalItems: totalCounts,
    totalPage: Math.ceil(totalCounts / limit),
  };
};

const findAllTacheOfUtilisateur = async (idUtilisateur) => {
  const taches = await Tache.find(
    {
      responsables: new mongoose.Types.ObjectId(idUtilisateur),
      status: { $ne: TACHE_DELETED_STATUS },
    },
    { _id: 1, nom: 1, status: 1 }
  ).sort({ status: "asc" });

  const formattedTaches = [];

  for (const t of taches) {
    formattedTaches.push({
      _id: t.id,
      nom: t.nom,
      status: TACHE_STATUS[t.status],
    });
  }

  return formattedTaches;
};

const inscription = async (utilisateur, role) => {
  const newUser = new Utilisateur();
  newUser.email = utilisateur.email;
  newUser.nom = utilisateur.nom;
  newUser.prenom = utilisateur.prenom;
  newUser.telephone = utilisateur.telephone;
  newUser.role = role;
  newUser.pwd = utilisateur.pwd;

  const errors = validateUtilisateurData(newUser);

  if (errors) {
    throw new Error(CAUSE_ERROR.badRequest, { cause: errors });
  } else {
    try {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(utilisateur.pwd, salt);
      newUser.pwd = hashedPassword;

      await newUser.save();
      const { pwd, status, role, __v, ...rest } = newUser._doc;
      return rest;
    } catch (error) {
      const parsedError = parseMongoDBError(error);
      throw new Error(CAUSE_ERROR.badRequest, { cause: [parsedError] });
    }
  }
};

const inscriptionClient = async (utilisateur) => {
  return await inscription(utilisateur, UTILISATEUR_ROLES.client);
};

const inscriptionMecanicien = async (utilisateur) => {
  return await inscription(utilisateur, UTILISATEUR_ROLES.mecanicien);
};

module.exports = {
  findAllUtilisateurs,
  findAllPaginatedMecano,
  findAllTacheOfUtilisateur,
  inscriptionClient,
  inscriptionMecanicien,
};
