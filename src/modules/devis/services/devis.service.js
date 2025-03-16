const DemandeDevis = require("../../../models/DemandeDevis");
const {
  DEMANDE_DEVIS_STATUS,
  PAGINATION_ROW,
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

  const formattedData = data.reduce((prev, current) => {
    prev[current["_id"].status] = current.count;
    return prev;
  }, {});

  return allStatus.map((s) => ({
    value: parseInt(s),
    count: formattedData[s] || 0,
    label: DEMANDE_DEVIS_STATUS[s],
  }));
};

module.exports = { getStatDemandeDevisByStatus, getDemandeDevis };
