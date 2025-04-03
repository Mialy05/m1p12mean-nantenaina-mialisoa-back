const Vehicule = require("../../../models/Vehicule");

const findAllVehicule = async () => {
  const vehicules = await Vehicule.find()
    .populate("marque")
    .populate("motorisation");
  return vehicules;
};
const findVehiculeById = async (id) => {
  const vehicules = await Vehicule.findOne({ _id: id })
    .populate("marque")
    .populate("motorisation");
  return vehicules;
};

const findVehiculeOfUser = async (email) => {
  const vehicules = await Vehicule.aggregate([
    {
      $lookup: {
        from: "utilisateurs",
        foreignField: "_id",
        localField: "utilisateur",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $match: {
        "user.email": email,
      },
    },
    {
      $lookup: {
        from: "marques",
        foreignField: "_id",
        localField: "marque",
        as: "marque",
      },
    },
    {
      $lookup: {
        from: "motorisations",
        foreignField: "_id",
        localField: "motorisation",
        as: "motorisation",
      },
    },
    {
      $project: {
        _id: 1,
        marque: {
          $arrayElemAt: ["$marque", 0],
        },
        modele: 1,
        annee: 1,
        motorisation: {
          $arrayElemAt: ["$motorisation", 0],
        },
        immatriculation: 1,
      },
    },
  ]);

  return vehicules;
};

module.exports = {
  findAllVehicule,
  findVehiculeById,
  findVehiculeOfUser,
};
