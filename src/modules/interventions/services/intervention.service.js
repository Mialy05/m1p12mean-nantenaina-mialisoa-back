const Intervention = require("../../../models/Intervention");
const { PAGINATION_ROW } = require("../../../shared/constants/constant");

const findAllInterventions = async (
  userRole,
  filter = {},
  page = 1,
  limit = PAGINATION_ROW
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
      },
    },
  ]);

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
