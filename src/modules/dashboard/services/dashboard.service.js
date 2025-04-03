const dayjs = require("dayjs");
const Facture = require("../../../models/Facture");
const Intervention = require("../../../models/Intervention");
const Devis = require("../../../models/Devis");
const RendezVous = require("../../../models/RendezVous");
const Tache = require("../../../models/Tache");
const { TACHE_STATUS } = require("../../../shared/constants/constant");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");

const findRecettes = async (dateStart, dateEnd) => {
  const filter = {
    $and: [
      {
        date: {
          $gte: dayjs(dateStart).toDate(),
        },
      },
      {
        date: {
          $lte: dayjs(dateEnd).toDate(),
        },
      },
    ],
  };

  const recettes = await Facture.aggregate([
    {
      $match: {
        ...filter,
      },
    },
    {
      $group: {
        _id: {
          month: {
            $month: "$date",
          },
          year: {
            $year: "$date",
          },
        },
        total: {
          $sum: "$montant",
        },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);
  return recettes;
};

const nbrInterventionStat = async (dateStart, dateEnd) => {
  const filter = {
    $and: [
      {
        date: {
          $gte: dayjs(dateStart).toDate(),
        },
      },
      {
        date: {
          $lte: dayjs(dateEnd).toDate(),
        },
      },
    ],
  };

  const interventions = await Intervention.countDocuments({
    date: {
      $gte: dateStart.toDate(),
      $lte: dateEnd.toDate(),
    },
  });
  const interventionsByApp = await Intervention.countDocuments({
    ...filter,
    "client._id": { $exists: true },
  });
  return {
    interventions,
    interventionsByAppPercent: Number(
      ((interventionsByApp * 100) / interventions).toFixed(2)
    ),
  };
};

const findDevisRdvStats = async (dateStart, dateEnd) => {
  const nbrDevis = await Devis.countDocuments({
    date: {
      $gte: dayjs(dateStart).toDate(),
      $lte: dayjs(dateEnd).toDate(),
    },
  });

  const nbrRdv = await RendezVous.countDocuments({
    $and: [
      {
        dateCreation: {
          $gte: dayjs(dateStart).toDate(),
        },
      },
      {
        dateCreation: {
          $lte: dayjs(dateEnd).toDate(),
        },
      },
      {
        // zay accepter ihany
        status: {
          $gt: 0,
        },
      },
    ],
  });

  return {
    nbrDevis,
    nbrRdv,
  };
};

const findMoreAskedService = async (dateStart, dateEnd) => {
  const data = await Tache.aggregate([
    {
      $lookup: {
        from: "interventions",
        localField: "intervention",
        foreignField: "_id",
        as: "interventionData",
      },
    },
    {
      $unwind: "$interventionData",
    },
    {
      $match: {
        "interventionData.date": {
          $gte: dayjs(dateStart).toDate(),
          $lte: dayjs(dateEnd).toDate(),
        },
      },
    },
    { $group: { _id: { nom: "$nom" }, count: { $sum: 1 } } },
    { $project: { _id: 0, nom: "$_id.nom", count: 1 } },

    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  return data;
};

const findClientFidelity = async (dateStart, dateEnd) => {
  const filter = {
    $and: [
      {
        date: {
          $gte: dayjs(dateStart).toDate(),
        },
      },
      {
        date: {
          $lte: dayjs(dateEnd).toDate(),
        },
      },
    ],
  };
  const data = Intervention.aggregate([
    {
      $match: {
        ...filter,
      },
    },
    {
      $group: {
        _id: {
          email: "$client.email",
          nom: "$client.nom",
          tel: "$client.tel",
          prenom: "$client.prenom",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        nom: "$_id.nom",
        prenom: "$_id.prenom",
        tel: "$_id.tel",
        email: "$_id.email",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
  return data;
};

const nbrInterventionOfMechanic = async (idMec, dateStart, dateEnd) => {
  // console.log(idMec, dateStart, dateEnd);
  const data = await Tache.aggregate([
    {
      $match: {
        responsables: idMec,
      },
    },
    {
      $lookup: {
        from: "interventions",
        localField: "intervention",
        foreignField: "_id",
        as: "interventionData",
      },
    },
    {
      $unwind: "$interventionData",
    },
    {
      $match: {
        "interventionData.date": {
          $gte: dayjs(dateStart).toDate(),
          $lte: dayjs(dateEnd).toDate(),
        },
      },
    },
    {
      $group: {
        _id: "$intervention",
        count: { $sum: 1 },
      },
    },
    {
      $count: "totalInterventions",
    },
  ]);
  return { interventions: data.length > 0 ? data[0].totalInterventions : 0 };
};

const findHourWorked = async (idMec, dateStart, dateEnd) => {
  const data = await Tache.aggregate([
    {
      $match: {
        responsables: idMec,
      },
    },
    {
      $lookup: {
        from: "interventions",
        localField: "intervention",
        foreignField: "_id",
        as: "interventionData",
      },
    },
    {
      $unwind: "$interventionData",
    },
    {
      $match: {
        "interventionData.date": {
          $gte: dayjs(dateStart).toDate(),
          $lte: dayjs(dateEnd).toDate(),
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$estimation" },
      },
    },
  ]);
  return data[0]?.total || 0;
};

const findCountTaskByStatusOfMechanic = async (idMec, dateStart, dateEnd) => {
  const data = await Tache.aggregate([
    {
      $match: {
        responsables: idMec,
      },
    },
    {
      $lookup: {
        from: "interventions",
        localField: "intervention",
        foreignField: "_id",
        as: "interventionData",
      },
    },
    {
      $unwind: "$interventionData",
    },
    {
      $match: {
        "interventionData.date": {
          $gte: dayjs(dateStart).toDate(),
          $lte: dayjs(dateEnd).toDate(),
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
      },
    },
  ]);
  return data.map((item) => ({ ...item, status: TACHE_STATUS[item.status] }));
};

module.exports = {
  findRecettes,
  nbrInterventionStat,
  findDevisRdvStats,
  findMoreAskedService,
  findClientFidelity,
  nbrInterventionOfMechanic,
  findHourWorked,
  findCountTaskByStatusOfMechanic,
};
