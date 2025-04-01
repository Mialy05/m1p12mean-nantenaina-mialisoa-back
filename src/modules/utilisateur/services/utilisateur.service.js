const Utilisateur = require("../../../models/Utilisateur");
const {
  UTILISATEUR_STATUS,
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const {
  PAGINATION_ROW,
  TACHE_DELETED_STATUS,
  TACHE_STATUS,
} = require("../../../shared/constants/constant");
const Tache = require("../../../models/Tache");
const { default: mongoose } = require("mongoose");

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

module.exports = {
  findAllUtilisateurs,
  findAllPaginatedMecano,
  findAllTacheOfUtilisateur,
};
