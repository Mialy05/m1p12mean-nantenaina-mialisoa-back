const Vehicule = require("../../../models/Vehicule");
const { PAGINATION_ROW } = require("../../../shared/constants/constant");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const { findUtilisateurById } = require("../../auth/services/auth.service");
const {
  findVehiculeById,
} = require("../../vehicules/services/vehicule.service");
const {
  getStatDemandeDevisByStatus,
  getDemandeDevis,
  getDevis,
  getStatDevisByStatus,
} = require("../services/devis.service");
const DemandeDevis = require("./../../../models/DemandeDevis");
const dayjs = require("dayjs");
const Devis = require("../../../models/Devis");

class DevisController {
  static async createDemandeDevis(req, res) {
    const annee = dayjs(req.body.vehicule.annee);
    req.body.vehicule.annee = annee.get("year");
    const demande = new DemandeDevis(req.body);
    demande.status = 0;

    demande.dateDemande = new Date();

    if (req.body.saveVehicule) {
      const vehicule = new Vehicule(req.body.vehicule);
      await vehicule.save();
      demande.vehiculeId = vehicule;
    }

    if (demande.vehiculeId) {
      const vehicule = await findVehiculeById(demande.vehiculeId);
      demande.vehicule = vehicule;
      demande.vehicule.marque = vehicule.marque.nom;
      demande.vehicule.motorisation = vehicule.motorisation.nom;
    }

    const utilisateur = await findUtilisateurById(req.userId);
    if (utilisateur) {
      demande.utilisateur = {};
      demande.utilisateur.id = utilisateur.id;
      demande.utilisateur.nom = utilisateur.nom;
      demande.utilisateur.prenom = utilisateur.prenom;

      demande.vehiculeId = undefined;
      console.log("demande", demande);

      await demande.save();

      res.json({ message: "Demande de devis créée" });
    } else {
      res.status(403).json({ isError: true, message: "Utilisateur invalide" });
    }
  }

  static async findAllDemandeDevis(req, res) {
    const {
      status,
      userId,
      immatriculation = "",
      nom = "",
      page = 1,
      limit = PAGINATION_ROW,
    } = req.query;

    const filter = {
      "vehicule.immatriculation": {
        $regex: `(?=.*${immatriculation})`,
        $options: "i",
      },
    };
    if (status && !isNaN(parseInt(status))) {
      filter.status = parseInt(status);
    }
    if (req.userRole === UTILISATEUR_ROLES.client) {
      filter["utilisateur.id"] = req.userId;
    } else if (req.userRole === UTILISATEUR_ROLES.manager) {
      filter["utilisateur.id"] = userId;
    }

    const nomParts = nom.split(/\s+/).filter((part) => part.trim() !== "");
    const searchRegex = nomParts.map((part) => `(?=.*${part})`).join("");

    const finalFilter = {
      $and: [
        filter,
        {
          $or: [
            { "utilisateur.nom": { $regex: searchRegex, $options: "i" } },
            { "utilisateur.prenom": { $regex: searchRegex, $options: "i" } },
          ],
        },
      ],
    };
    const { status: filterStatus, ...filterWithoutStatus } = filter;

    const demandes = await getDemandeDevis(finalFilter, page, limit);

    const statsDemandes = await getStatDemandeDevisByStatus({
      $and: [
        filterWithoutStatus,
        {
          $or: [
            { "utilisateur.nom": { $regex: searchRegex, $options: "i" } },
            { "utilisateur.prenom": { $regex: searchRegex, $options: "i" } },
          ],
        },
      ],
    });

    res.json({
      isError: false,
      data: {
        ...demandes,
        stats: statsDemandes,
      },
    });
  }

  static async createDevis(req, res) {
    try {
      const devis = new Devis(req.body);
      devis.numero = dayjs().format("YYYYMMDDHHmmss");
      devis.date = new Date();
      devis.status = 0;
      devis.vehicule.annee = dayjs(req.body.vehicule.annee).get("year");

      await devis.save();
      // throw new Error("Not implemented");
      res.json({ message: "Devis créé" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json(ApiResponse.error("Une erreur est survenue", error, 500));
    }
  }

  static async findAllDevis(req, res) {
    const {
      status,
      userId,
      immatriculation = "",
      nom = "",
      page = 1,
      limit = PAGINATION_ROW,
    } = req.query;

    const filter = {
      "vehicule.immatriculation": {
        $regex: `(?=.*${immatriculation})`,
        $options: "i",
      },
    };
    if (status && !isNaN(parseInt(status))) {
      filter.status = parseInt(status);
    }
    if (req.userRole === UTILISATEUR_ROLES.client) {
      filter["client.id"] = req.userId;
    } else if (req.userRole === UTILISATEUR_ROLES.manager) {
      filter["client.id"] = userId;
    }

    const nomParts = nom.split(/\s+/).filter((part) => part.trim() !== "");
    const searchRegex = nomParts.map((part) => `(?=.*${part})`).join("");

    const finalFilter = {
      $and: [
        filter,
        {
          $or: [
            { "client.nom": { $regex: searchRegex, $options: "i" } },
            { "client.prenom": { $regex: searchRegex, $options: "i" } },
          ],
        },
      ],
    };
    const { status: filterStatus, ...filterWithoutStatus } = filter;

    try {
      const devis = await getDevis(finalFilter, page, limit);

      const statsDevis = await getStatDevisByStatus({
        $and: [
          filterWithoutStatus,
          {
            $or: [
              { "client.nom": { $regex: searchRegex, $options: "i" } },
              { "client.prenom": { $regex: searchRegex, $options: "i" } },
            ],
          },
        ],
      });
      res.json(ApiResponse.success({ ...devis, stats: statsDevis }));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
}

module.exports = DevisController;
