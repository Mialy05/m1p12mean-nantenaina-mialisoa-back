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
  getDevisById,
  generateStreamDevisPDF,
  generateDevisPDF,
  getDemandeDevisById,
} = require("../services/devis.service");
const DemandeDevis = require("./../../../models/DemandeDevis");
const dayjs = require("dayjs");
const Devis = require("../../../models/Devis");
const { default: mongoose } = require("mongoose");

class DevisController {
  static async createDemandeDevis(req, res) {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      const utilisateur = await findUtilisateurById(req.query.userId);
      if (!utilisateur) {
        await session.abortTransaction();
        res
          .status(403)
          .json({ isError: true, message: "Utilisateur invalide" });
      }
      const annee = dayjs(req.body.vehicule.annee);
      req.body.vehicule.annee = annee.get("year");
      const { vehiculeId, _id, ...demandeData } = req.body;
      const demande = new DemandeDevis(demandeData);
      demande.status = 0;
      demande.dateDemande = dayjs().toDate();
      demande.utilisateur = utilisateur;

      if (vehiculeId === "0") {
        const vehicule = new Vehicule(req.body.vehicule);
        demande.vehicule = vehicule;
        vehicule.utilisateur = utilisateur.id;
        await vehicule.save({ session });
      } else {
        const vehicule = await findVehiculeById(vehiculeId);
        demande.vehicule = vehicule;
      }

      console.log(demande);
      await demande.save({ session });

      await session.commitTransaction();
      res.json({ message: "Demande de devis créée" });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      res
        .status(500)
        .json(ApiResponse.error("Une erreur est survenue", error, 500));
    } finally {
      await session.endSession();
    }
  }

  static async findAllDemandeDevis(req, res) {
    const {
      status,
      clientId,
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
    if (req.query.userRole === UTILISATEUR_ROLES.client) {
      filter["utilisateur._id"] = new mongoose.Types.ObjectId(req.query.userId);
    } else if (req.query.userRole === UTILISATEUR_ROLES.manager && clientId) {
      filter["utilisateur._id"] = new mongoose.Types.ObjectId(clientId);
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

    const statsDemandes = await getStatDemandeDevisByStatus(
      {
        $and: [
          filterWithoutStatus,
          {
            $or: [
              { "utilisateur.nom": { $regex: searchRegex, $options: "i" } },
              { "utilisateur.prenom": { $regex: searchRegex, $options: "i" } },
            ],
          },
        ],
      },
      req.query.userRole
    );

    res.json({
      isError: false,
      data: {
        ...demandes,
        stats: statsDemandes,
      },
    });
  }

  static async createDevis(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (req.body.idDemande != "") {
        const idDemande = req.body.idDemande;
        const demande = await DemandeDevis.findById(idDemande);
        if (!demande) {
          throw new Error("Demande introuvable");
        }
        demande.status = 5;
        await demande.save({ session });
      }

      const devis = new Devis();
      devis.numero = dayjs().format("YYYYMMDDHHmmss");
      devis.date = dayjs().toDate();
      devis.status = 0;
      devis.vehicule = req.body.vehicule;
      if (req.body.vehicule._id == "") {
        devis.vehicule._id = undefined;
      }
      devis.client = req.body.client;
      if (req.body.client._id == "") {
        devis.client._id = undefined;
      }
      devis.services = req.body.services;
      devis.vehicule.annee = dayjs(req.body.vehicule.annee).get("year");

      await devis.save({ session });
      console.log(req.body.client);

      await session.commitTransaction();
      // throw new Error("Not implemented");
      res.json({ message: "Devis créé" });
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      res
        .status(500)
        .json(ApiResponse.error("Une erreur est survenue", error, 500));
    } finally {
      await session.endSession();
    }
  }

  static async findAllDevis(req, res) {
    const {
      status,
      clientId,
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
    if (req.query.userRole === UTILISATEUR_ROLES.client) {
      filter["client._id"] = new mongoose.Types.ObjectId(req.query.userId);
    } else if (req.query.userRole === UTILISATEUR_ROLES.manager && clientId) {
      filter["client._id"] = new mongoose.Types.ObjectId(clientId);
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

      const statsDevis = await getStatDevisByStatus(
        {
          $and: [
            filterWithoutStatus,
            {
              $or: [
                { "client.nom": { $regex: searchRegex, $options: "i" } },
                { "client.prenom": { $regex: searchRegex, $options: "i" } },
              ],
            },
          ],
        },
        req.query.userRole
      );
      res.json(ApiResponse.success({ ...devis, stats: statsDevis }));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async findDevisById(req, res) {
    const { id } = req.params;
    const { userRole, userId } = req.query;
    try {
      const devis = await getDevisById(id);
      if (devis) {
        if (
          userRole == UTILISATEUR_ROLES.client &&
          devis.client._id != userId
        ) {
          res.status(403).json(ApiResponse.error("Ressource interdite."));
        } else {
          res.json(ApiResponse.success(devis));
        }
      } else {
        res.status(422).json(ApiResponse.error("Devis introuvable."));
      }
    } catch (error) {
      console.log(error);

      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async generatePDF(req, res) {
    const { id } = req.params;
    const { userId, userRole } = req.query;
    try {
      const devis = await getDevisById(id);

      if (userRole === UTILISATEUR_ROLES.client && devis.client._id != userId) {
        return res.status(403).json(ApiResponse.error("Ressource interdite."));
      }

      if (devis) {
        const doc = await generateDevisPDF(devis);
        if (doc) {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=DEVIS-${devis.vehicule.immatriculation}-${devis.numero}.pdf`
          );
          doc.pipe(res);
          doc.end();
        } else {
          res
            .status(500)
            .json(ApiResponse.error("Erreur lors de la génération du PDF."));
        }
      } else {
        res.status(404).json({ error: "Devis introuvable." });
      }
    } catch (error) {
      console.error(error);

      res.status(500).json({ error: "Erreur lors de la génération du PDF." });
    }
  }

  static async findDemandeDevisById(req, res) {
    const { id } = req.params;
    try {
      console.log(id);

      const demande = await getDemandeDevisById(id);
      if (demande) {
        res.json(ApiResponse.success(demande));
      } else {
        res.status(422).json(ApiResponse.error("Demande introuvable"));
      }
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
}

module.exports = DevisController;
