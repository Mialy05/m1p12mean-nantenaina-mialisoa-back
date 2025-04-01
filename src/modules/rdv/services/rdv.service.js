const dayjs = require("dayjs");
const RendezVous = require("../../../models/RendezVous");
const Devis = require("../../../models/Devis");
const { DEVIS_WAIT_RDV } = require("../../../shared/constants/constant");
const Intervention = require("../../../models/Intervention");
const Tache = require("../../../models/Tache");
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

const createRdv = async (idDevis, session) => {
  const devis = await Devis.findOne({ _id: idDevis });
  if (!devis) {
    throw Error("Devis introuvable");
    // res.status(400).json(ApiResponse.error("Devis introuvable"));
  }
  if (devis.status !== 0) {
    throw Error("Devis déjà validé");
    // res.status(400).json(ApiResponse.error("Devis déjà validé"));
    // return;
  }
  devis.status = DEVIS_WAIT_RDV;
  await devis.save({ session });

  const rdv = new RendezVous();
  rdv.devis = idDevis;
  rdv.dateCreation = dayjs();
  await rdv.save({ session });

  return rdv;
};

const acceptRdvService = async (idRdv, dateAccept, session) => {
  const rdv = await RendezVous.findOne({ _id: idRdv }, null, { session });
  if (!rdv) {
    console.log("Rendez-vous introuvable", idRdv);

    throw new Error("Rendez-vous introuvable");
  }
  const idDevis = rdv.devis;
  rdv.status = 10;
  rdv.date = dayjs(dateAccept);

  const devis = await Devis.findOne({ _id: idDevis });
  devis.status = 10;
  await devis.save({ session });

  const intervention = new Intervention();
  intervention.vehicule = devis.vehicule;
  intervention.client = devis.client;
  intervention.date = rdv.date;
  const idIntervention = await intervention.save({ session });

  for (const service of devis.services) {
    const tache = new Tache();

    tache.nom = service.nom;
    tache.estimation = service.heures;
    tache.intervention = idIntervention;

    await tache.save({ session });
  }

  await rdv.save({ session });
};

const planifyRdv = async (date, idDevis, session) => {
  const dateRdv = dayjs(date).toISOString();

  try {
    const rdv = await createRdv(idDevis, session);
    // console.log("rdv", rdv);

    if (!rdv) {
      throw new Error("Rendez-vous introuvable");
    }

    await acceptRdvService(rdv._id, dateRdv, session);
    return;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findAllDemandeRdv,
  findAllAcceptedRdv,
  createRdv,
  acceptRdvService,
  planifyRdv,
};
