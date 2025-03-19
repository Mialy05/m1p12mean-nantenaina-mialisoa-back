const { default: mongoose } = require("mongoose");
const DemandeDevis = require("../../../models/DemandeDevis");
const Devis = require("../../../models/Devis");
const {
  DEMANDE_DEVIS_STATUS,
  PAGINATION_ROW,
  DEVIS_STATUS,
} = require("../../../shared/constants/constant");

const getDemandeDevis = async (
  filter = {},
  page = 1,
  limit = PAGINATION_ROW
) => {
  const pagination = {
    skip: (page - 1) * limit,
    limit,
  };
  const demandes = await DemandeDevis.find(filter)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ dateDemande: -1 })
    .populate({
      path: "vehicule",
      populate: [
        {
          path: "marque",
          model: "Marque",
        },
        {
          path: "motorisation",
          model: "Motorisation",
        },
      ],
    });
  const totalDemandes = await DemandeDevis.countDocuments(filter);

  return {
    items: demandes,
    page,
    limit,
    totalItems: totalDemandes,
    totalPage: Math.ceil(totalDemandes / limit),
  };
};

// TODO: rectifier car ne va pas marcher pour manager
const getStatDemandeDevisByStatus = async (filter = {}) => {
  const data = await DemandeDevis.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          client: "$utilisateur.id",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const allStatus = Object.keys(DEMANDE_DEVIS_STATUS);
  let total = 0;

  const formattedData = {};
  data.forEach((d) => {
    formattedData[d["_id"].status] = d.count;
    total += d.count;
  });

  return [
    {
      value: null,
      count: total,
      label: "Tous",
    },
    ...allStatus.map((s) => ({
      value: parseInt(s),
      count: formattedData[s] || 0,
      label: DEMANDE_DEVIS_STATUS[s],
    })),
  ];
};

const getDevis = async (filter = {}, page = 1, limit = PAGINATION_ROW) => {
  const devis = await Devis.aggregate([
    {
      $match: filter,
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
    {
      $addFields: {
        total: {
          $sum: {
            $map: {
              input: "$services",
              as: "service",
              in: { $multiply: ["$$service.prix", "$$service.heures"] },
            },
          },
        },
      },
    },
    {
      $project: {
        client: 1,
        services: {
          nom: 1,
          _id: 1,
        },
        vehicule: {
          modele: 1,
          immatriculation: 1,
        },
        numero: 1,
        date: 1,
        total: 1,
        status: 1,
      },
    },
    {
      $sort: { date: -1 },
    },
  ]);
  const totalDemandes = await Devis.countDocuments(filter);

  return {
    items: devis,
    page,
    limit,
    totalItems: totalDemandes,
    totalPage: Math.ceil(totalDemandes / limit),
  };
};

// TODO: rectifier car ne va pas marcher pour manager
const getStatDevisByStatus = async (filter = {}) => {
  const data = await Devis.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          client: "$client.id",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const allStatus = Object.keys(DEVIS_STATUS);
  let total = 0;

  const formattedData = {};
  data.forEach((d) => {
    formattedData[d["_id"].status] = d.count;
    total += d.count;
  });

  return [
    {
      value: null,
      count: total,
      label: "Tous",
    },
    ...allStatus.map((s) => ({
      value: parseInt(s),
      count: formattedData[s] || 0,
      label: DEVIS_STATUS[s],
    })),
  ];
};

const getDevisById = async (id) => {
  const devis = await Devis.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $addFields: {
        services: {
          $map: {
            input: "$services",
            as: "service",
            in: {
              $mergeObjects: [
                "$$service",
                {
                  total: { $multiply: ["$$service.prix", "$$service.heures"] },
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        total: {
          $sum: {
            $map: {
              input: "$services",
              as: "service",
              in: "$$service.total",
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "marques",
        localField: "vehicule.marque",
        foreignField: "_id",
        as: "vehicule.marqueDetails",
      },
    },
    {
      $lookup: {
        from: "motorisations",
        localField: "vehicule.motorisation",
        foreignField: "_id",
        as: "vehicule.motorisationDetails",
      },
    },
    {
      $project: {
        _id: 1,
        client: 1,
        services: 1,
        numero: 1,
        date: 1,
        status: 1,
        total: 1,
        vehicule: {
          modele: 1,
          immatriculation: 1,
          kilometrage: 1,
          annee: 1,
          marque: { $arrayElemAt: ["$vehicule.marqueDetails", 0] },
          motorisation: { $arrayElemAt: ["$vehicule.motorisationDetails", 0] },
        },
      },
    },
  ]);
  return devis[0];
};
// {
//   $project: {
//     vehicule: {
//       marqueDetails: { $arrayElemAt: ["$vehicule.marqueDetails", 0] },
//       motorisationDetails: { $arrayElemAt: ["$vehicule.motorisationDetails", 0] },
//       modele: 1,
//       immatriculation: 1,
//       kilometrage: 1,
//       annee: 1,
//     },
//     services: 1,
//     total: 1,
//   },
// }
module.exports = {
  getStatDemandeDevisByStatus,
  getDemandeDevis,
  getDevis,
  getStatDevisByStatus,
  getDevisById,
};
