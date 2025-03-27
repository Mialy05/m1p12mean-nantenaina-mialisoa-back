const Intervention = require("../../../models/Intervention");
const { PAGINATION_ROW } = require("../../../shared/constants/constant");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const mongoose = require("mongoose");
const Utilisateurs = require("../../../models/Utilisateur");

const showResponsable = (userRole) => {
  if (userRole === UTILISATEUR_ROLES.client) {
    return;
  }
  return { responsables: 1 };
};

const filterByResp = (userRole, userId) => {
  if (userRole === UTILISATEUR_ROLES.mecanicien) {
    return {
      "taches.responsables": new mongoose.Types.ObjectId(String(userId)),
    };
  }
  return {};
};

const findAllInterventions = async (
  userRole,
  filter = {},
  page = 1,
  limit = PAGINATION_ROW,
  userRequestRole,
  userRequestId
) => {
  const interventions = await Intervention.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "marques",
        localField: "vehicule.marque",
        foreignField: "_id",
        as: "vehicule.marque",
      },
    },
    {
      $lookup: {
        from: "taches",
        localField: "_id",
        foreignField: "intervention",
        as: "taches",
      },
    },
    {
      $match: filterByResp(userRequestRole, userRequestId),
    },
    {
      $sort: { date: -1 },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        date: 1,
        status: 1,
        vehicule: {
          marque: {
            $arrayElemAt: ["$vehicule.marque", 0],
          },
          modele: 1,
          immatriculation: 1,
        },
        client: 1,
        taches: {
          _id: 1,
          status: 1,
          nom: 1,
          ...showResponsable(userRequestRole),
        },
      },
    },
  ]);

  for (let intervention of interventions) {
    for (let tache of intervention.taches) {
      const resp = await Utilisateurs.find({
        _id: tache.responsables,
      });
      tache.responsables = resp;
    }
  }

  const totalInterventions = await Intervention.countDocuments(filter);

  return {
    items: interventions,
    page,
    limit,
    totalItems: totalInterventions,
    totalPage: Math.ceil(totalInterventions / limit),
  };
};

module.exports = { findAllInterventions };
