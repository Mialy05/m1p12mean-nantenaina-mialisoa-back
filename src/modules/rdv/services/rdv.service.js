const dayjs = require("dayjs");
const RendezVous = require("../../../models/RendezVous");

const findAllDemandeRdv = async (page = 1, limit = 50) => {
  const filter = {
    $or: [
      {
        date: { $exists: false },
      },
      {
        date: null,
      },
    ],
  };

  const demandes = await RendezVous.aggregate([
    {
      $lookup: {
        from: "devis",
        localField: "devis",
        foreignField: "_id",
        as: "devis",
      },
    },
    {
      $match: { ...filter },
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
        dateCreation: 1,
        devis: {
          $arrayElemAt: ["$devis", 0],
        },
        status: 1,
      },
    },
  ]);

  const count = await RendezVous.countDocuments({ ...filter });

  return {
    demandes,
    count,
  };
};
const findAllAcceptedRdv = async (startDate, endDate, userId) => {
  if (!startDate || !endDate) {
    throw new Error("startDate and endDate are required");
  }

  const filter = {
    $and: [
      {
        date: { $exists: true },
      },
      {
        date: { $ne: null },
      },
      {
        date: { $gte: dayjs(startDate).toDate() },
      },
      {
        date: { $lte: dayjs(endDate).toDate() },
      },
    ],
  };

  if (userId) {
    filter.$and.push({
      "devis.client.id": userId,
    });
  }

  const rdvs = await RendezVous.aggregate([
    {
      $lookup: {
        from: "devis",
        localField: "devis",
        foreignField: "_id",
        as: "devis",
      },
    },
    {
      $match: { ...filter },
    },
    {
      $project: {
        date: 1,
        dateCreation: 1,
        devis: {
          $arrayElemAt: ["$devis", 0],
        },
        status: 1,
      },
    },
  ]);

  return rdvs;
};

module.exports = {
  findAllDemandeRdv,
  findAllAcceptedRdv,
};
