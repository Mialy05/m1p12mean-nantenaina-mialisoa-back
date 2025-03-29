const Intervention = require("../../../models/Intervention");
const {
  PAGINATION_ROW,
  TACHE_STATUS,
  DELETED_INTERVENTION_STATUS,
  CREATED_INTERVENTION_STATUS,
  CREATED_TACHE_STATUS,
  TACHE_CREATED_STATUS,
  TACHE_DELETED_STATUS,
  CAUSE_ERROR,
} = require("../../../shared/constants/constant");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const mongoose = require("mongoose");
const Utilisateurs = require("../../../models/Utilisateur");
const Tache = require("../../../models/Tache");

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
      const resp = await Utilisateurs.find(
        {
          _id: tache.responsables,
        },
        {
          _id: 1,
          nom: 1,
          prenom: 1,
          email: 1,
          telephone: 1,
        }
      );
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

const getAllowedTransition = (currentStatus) => {
  const statusKeys = Object.keys(TACHE_STATUS)
    .map(Number)
    .sort((a, b) => a - b);

  const currentIndex = statusKeys.indexOf(currentStatus);
  if (currentIndex === -1) {
    throw new Error("Statut actuel invalide");
  }

  const transitions = {};

  if (currentStatus > 0 && currentIndex > 0 && currentStatus >= statusKeys[0]) {
    transitions.previous = {
      step: TACHE_STATUS[statusKeys[currentIndex - 1]],
      value: statusKeys[currentIndex - 1],
    };
  }

  if (currentIndex < statusKeys.length - 1) {
    transitions.next = {
      step: TACHE_STATUS[statusKeys[currentIndex + 1]],
      value: statusKeys[currentIndex + 1],
    };
  }

  return transitions;
};

const findInterventionById = async (idIntervention, userRole) => {
  const intervention = (
    await Intervention.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idIntervention),
          status: { $ne: DELETED_INTERVENTION_STATUS },
        },
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
          from: "motorisations",
          localField: "vehicule.motorisation",
          foreignField: "_id",
          as: "vehicule.motorisation",
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
        $project: {
          date: 1,
          status: 1,
          vehicule: {
            marque: {
              $arrayElemAt: ["$vehicule.marque", 0],
            },
            modele: 1,
            immatriculation: 1,
            motorisation: {
              $arrayElemAt: ["$vehicule.motorisation", 0],
            },
          },
          client: userRole == UTILISATEUR_ROLES.manager ? 1 : undefined,
          taches: {
            _id: 1,
            status: 1,
            nom: 1,
            estimation: 1,
            responsables: 1,
          },
        },
      },
    ])
  )[0];
  if (intervention) {
    const groupedByStatus = Object.keys(TACHE_STATUS)
      .filter((k) => k >= 0)
      .reduce((acc, status) => {
        acc[TACHE_STATUS[status]] = {
          value: status,
          label: TACHE_STATUS[status],
          taches: [],
        };
        return acc;
      }, {});

    for (let tache of intervention.taches) {
      const resp = await Utilisateurs.find(
        {
          _id: tache.responsables,
        },
        {
          _id: 1,
          nom: 1,
          prenom: 1,
          email: 1,
          telephone: 1,
        }
      );
      tache.responsables = resp;
      if (groupedByStatus[TACHE_STATUS[tache.status]] !== undefined) {
        groupedByStatus[TACHE_STATUS[tache.status]].taches.push(tache);
      }
      tache.actionPermis = getAllowedTransition(tache.status);
    }

    intervention.taches = Object.values(groupedByStatus);
  }

  return intervention;
};

const assignTacheToResponsable = async (idTache, idResponsables) => {
  const tacheObjectId = new mongoose.Types.ObjectId(idTache);
  const tache = await Tache.findOne({ _id: tacheObjectId, status: 0 });
  if (tache) {
    const respObjectIds = idResponsables.map(
      (r) => new mongoose.Types.ObjectId(r)
    );
    await Tache.updateOne(
      {
        _id: tacheObjectId,
        status: { $gte: CREATED_INTERVENTION_STATUS },
      },
      {
        $addToSet: {
          responsables: {
            $each: respObjectIds,
          },
        },
      }
    );
  } else {
    throw new Error("Tache n'existe pas", { cause: 404 });
  }
};

const deleteTache = async (idTache) => {
  const tacheObjectId = new mongoose.Types.ObjectId(idTache);
  const tache = await Tache.findOne({
    _id: tacheObjectId,
    status: { $gte: TACHE_CREATED_STATUS },
  });
  if (tache) {
    await Tache.updateOne(
      {
        _id: tacheObjectId,
      },
      { $set: { status: TACHE_DELETED_STATUS } }
    );
  } else {
    throw new Error("Tache n'existe pas", { cause: 404 });
  }
};

const isTransitionAllowed = (currentStatus, targetStatus) => {
  const allowedTransitions = getAllowedTransition(currentStatus);
  return (
    allowedTransitions.previous?.value == targetStatus ||
    allowedTransitions.next?.value == targetStatus
  );
};

const updateTacheStatus = async (idTache, targetStatus) => {
  const tacheObjectId = new mongoose.Types.ObjectId(idTache);
  const statusKeys = Object.keys(TACHE_STATUS).map(Number);

  const currentIndex = statusKeys.indexOf(targetStatus);
  if (currentIndex === -1) {
    throw new Error("Statut cible invalide", {
      cause: CAUSE_ERROR.validationError,
    });
  }

  const tache = await Tache.findOne({
    _id: tacheObjectId,
    status: { $gte: TACHE_CREATED_STATUS },
  });
  if (tache) {
    if (targetStatus == TACHE_DELETED_STATUS) {
      await deleteTache(idTache);
    } else {
      if (isTransitionAllowed(tache.status, targetStatus)) {
        await Tache.updateOne(
          {
            _id: tacheObjectId,
          },
          { $set: { status: targetStatus } }
        );
      } else {
        throw new Error(
          "Cette transition d'état n'est pas permise pour cette tâche",
          { cause: CAUSE_ERROR.forbidden }
        );
      }
    }
  } else {
    throw new Error("Tache n'existe pas", { cause: CAUSE_ERROR.notFound });
  }
};

module.exports = {
  findAllInterventions,
  findInterventionById,
  assignTacheToResponsable,
  deleteTache,
  updateTacheStatus,
};
