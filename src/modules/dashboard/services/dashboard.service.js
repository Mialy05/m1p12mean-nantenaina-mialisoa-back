const dayjs = require("dayjs");
const Facture = require("../../../models/Facture");
const Intervention = require("../../../models/Intervention");
const Devis = require("../../../models/Devis");
const RendezVous = require("../../../models/RendezVous");
const Tache = require("../../../models/Tache");
const {
  TACHE_STATUS,
  DATE_FILTER_FORMAT,
} = require("../../../shared/constants/constant");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);
const findRecettes = async (dateStart, dateEnd) => {
  const filter = {
    $and: [
      {
        date: {
          $gte: dayjs(dateStart, DATE_FILTER_FORMAT).startOf("day").toDate(),
        },
      },
      {
        date: {
          $lte: dayjs(dateEnd, DATE_FILTER_FORMAT).endOf("day").toDate(),
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
  const gte = dayjs(dateStart, DATE_FILTER_FORMAT).startOf("day").toDate();
  const lte = dayjs(dateEnd, DATE_FILTER_FORMAT).endOf("day").toDate();
  const filter = {
    $and: [
      {
        date: {
          $gte: gte,
        },
      },
      {
        date: {
          $lte: lte,
        },
      },
    ],
  };

  const interventions = await Intervention.countDocuments({
    date: {
      $gte: gte,
      $lte: lte,
    },
  });
  const interventionsByApp = await Intervention.countDocuments({
    ...filter,
    "client._id": { $exists: true },
  });
  return {
    interventions,
    interventionsByApp,
    interventionsByAppPercent: Number(
      ((interventionsByApp * 100) / interventions).toFixed(2)
    ),
  };
};

const findDevisRdvStats = async (dateStart, dateEnd) => {
  const gte = dayjs(dateStart, DATE_FILTER_FORMAT).startOf("day").toDate();
  const lte = dayjs(dateEnd, DATE_FILTER_FORMAT).endOf("day").toDate();
  const nbrDevis = await Devis.countDocuments({
    date: {
      $gte: gte,
      $lte: lte,
    },
  });

  const nbrRdv = await RendezVous.countDocuments({
    $and: [
      {
        dateCreation: {
          $gte: gte,
        },
      },
      {
        dateCreation: {
          $lte: lte,
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
  const gte = dayjs(dateStart, DATE_FILTER_FORMAT).startOf("day").toDate();
  const lte = dayjs(dateEnd, DATE_FILTER_FORMAT).endOf("day").toDate();

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
          $gte: gte,
          $lte: lte,
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
  const gte = dayjs(dateStart, DATE_FILTER_FORMAT).startOf("day").toDate();
  const lte = dayjs(dateEnd, DATE_FILTER_FORMAT).endOf("day").toDate();

  const filter = {
    $and: [
      {
        date: {
          $gte: gte,
        },
      },
      {
        date: {
          $lte: lte,
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
  const gte = dayjs(dateStart, DATE_FILTER_FORMAT).startOf("day").toDate();
  const lte = dayjs(dateEnd, DATE_FILTER_FORMAT).endOf("day").toDate();

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
          $gte: gte,
          $lte: lte,
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
  const gte = dayjs(dateStart, DATE_FILTER_FORMAT).startOf("day").toDate();
  const lte = dayjs(dateEnd, DATE_FILTER_FORMAT).endOf("day").toDate();

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
          $gte: gte,
          $lte: lte,
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
  const gte = dayjs(dateStart, DATE_FILTER_FORMAT).startOf("day").toDate();
  const lte = dayjs(dateEnd, DATE_FILTER_FORMAT).endOf("day").toDate();

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
          $gte: gte,
          $lte: lte,
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
