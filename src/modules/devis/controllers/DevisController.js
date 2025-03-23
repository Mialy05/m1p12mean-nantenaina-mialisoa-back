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
      demande.utilisateur.email = utilisateur.email;
      demande.utilisateur.telephone = utilisateur.telephone;

      demande.vehiculeId = undefined;

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
    } else if (req.userRole === UTILISATEUR_ROLES.manager && userId) {
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
      req.userRole
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
      const idDemande = req.body.idDemande;
      const demande = await DemandeDevis.findById(idDemande);
      if (demande) {
        demande.status = 5;
        await demande.save({ session });
      }

      const devis = new Devis(req.body);
      devis.numero = dayjs().format("YYYYMMDDHHmmss");
      devis.date = dayjs().toISOString();
      devis.status = 0;
      devis.vehicule.annee = dayjs(req.body.vehicule.annee).get("year");

      await devis.save({ session });
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
    } else if (req.userRole === UTILISATEUR_ROLES.manager && userId) {
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
        req.userRole
      );
      res.json(ApiResponse.success({ ...devis, stats: statsDevis }));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async findDevisById(req, res) {
    const { id } = req.params;
    const { userRole, userId } = req;
    try {
      const devis = await getDevisById(id);
      if (devis) {
        if (userRole == UTILISATEUR_ROLES.client && devis.client.id != userId) {
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
    const { userId, userRole } = req;
    try {
      const devis = await getDevisById(id);

      // TODO: refactor ?
      if (userRole === UTILISATEUR_ROLES.client && devis.client.id !== userId) {
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
