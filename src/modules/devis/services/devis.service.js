const { default: mongoose } = require("mongoose");
const DemandeDevis = require("../../../models/DemandeDevis");
const Devis = require("../../../models/Devis");
const {
  PAGINATION_ROW,
  GARAGE,
} = require("../../../shared/constants/constant");
const PDFDocument = require("pdfkit-table");
const dayjs = require("dayjs");
const { formatNumber } = require("../../../shared/helpers/number");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const {
  getStatusDemandeDevisValues,
  getStatusDevisValues,
} = require("../../../shared/helpers/status");
require("dayjs/locale/fr");
dayjs.locale("fr");

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
const getStatDemandeDevisByStatus = async (
  filter = {},
  role = UTILISATEUR_ROLES.client
) => {
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

  const DEMANDE_STATUS = getStatusDemandeDevisValues(role);
  const allStatus = Object.keys(DEMANDE_STATUS);
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
      label: DEMANDE_STATUS[s],
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
const getStatDevisByStatus = async (
  filter = {},
  role = UTILISATEUR_ROLES.client
) => {
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

  const DEVIS_STATUS = getStatusDevisValues(role);
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
// size  A4 595.28 x 841.89
const generateDevisPDF = async (devis) => {
  console.log(`Génération du devis ${devis.id}`);

  const normalFontSize = 12;
  const subTitleFontSize = 18;
  const fontNormal = "Helvetica";
  const fontBold = "Helvetica-Bold";
  const margin = 30;
  const documentWidth = 595;
  const logoWidth = 80;

  const doc = new PDFDocument({ margin: 30, size: "A4" });

  doc.image("public/logo.jpg", margin, doc.y, {
    width: 80,
  });

  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(GARAGE.nom, logoWidth + 30, doc.y + 5);
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(GARAGE.adresse, logoWidth + 30, doc.y + 5);
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(GARAGE.email, logoWidth + 30, doc.y + 5);
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(GARAGE.telephone, logoWidth + 30, doc.y + 5);

  doc.moveDown();
  doc.moveDown();

  doc
    .font(fontBold)
    .fontSize(22)
    .text(`Devis de réparation`, margin, doc.y, { align: "center" });
  doc.moveDown();

  doc.lineGap(3);

  doc
    .font(fontBold)
    .fontSize(normalFontSize)
    .text("Numéro: ", margin, doc.y, { continued: true });
  doc.font(fontNormal).fontSize(normalFontSize).text(devis.numero);
  doc
    .font(fontBold)
    .fontSize(normalFontSize)
    .text("Date: ", { continued: true });
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(dayjs(devis.date).format("DD MMMM YYYY"));

  // ------------------------------------------------
  doc.moveDown();
  doc
    .lineWidth(0.5)
    .strokeColor("#87c1ff")
    .moveTo(margin, doc.y)
    .lineTo(documentWidth - margin * 2, doc.y)
    .stroke();
  doc.moveDown();
  // ------------------------------------------------

  doc.moveDown(0.5);
  doc.font(fontBold).fontSize(subTitleFontSize).text("Client");
  doc.moveDown(0.5);

  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(`${[devis.client.nom, devis.client.prenom].join(" ")}`);
  doc.font(fontNormal).fontSize(normalFontSize).text(devis.client.email);
  doc.font(fontNormal).fontSize(normalFontSize).text(devis.client.telephone);

  // ------------------------------------------------
  doc.moveDown();
  doc
    .lineWidth(0.5)
    .strokeColor("#87c1ff")
    .moveTo(margin, doc.y)
    .lineTo(documentWidth - margin * 2, doc.y)
    .stroke();
  doc.moveDown();
  // ------------------------------------------------

  doc.moveDown(0.5);
  doc.font(fontBold).fontSize(subTitleFontSize).text("Véhicule");
  doc.moveDown(0.5);

  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text("Marque: ", { continued: true });
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(`${devis.vehicule.marque.nom} - ${devis.vehicule.modele}`, {
      lineBreak: true,
    });

  doc.fontSize(normalFontSize).text("Immatriculation: ", { continued: true });
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(devis.vehicule.immatriculation, { lineBreak: true });

  doc.fontSize(normalFontSize).text("Moteur: ", { continued: true });
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(devis.vehicule.motorisation.nom);

  doc
    .fontSize(normalFontSize)
    .text("Mise en circulation: ", { continued: true });
  doc.font(fontNormal).fontSize(normalFontSize).text(devis.vehicule.annee);

  doc.fontSize(normalFontSize).text("Kilométrage: ", { continued: true });
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(`${formatNumber(devis.vehicule.kilometrage)} km`);

  // ------------------------------------------------
  doc.moveDown();
  doc
    .lineWidth(0.5)
    .strokeColor("#87c1ff")
    .moveTo(margin, doc.y)
    .lineTo(documentWidth - margin * 2, doc.y)
    .stroke();
  doc.moveDown();
  // ------------------------------------------------

  doc.moveDown(0.5);
  doc.font(fontBold).fontSize(subTitleFontSize).text("Interventions");
  doc.moveDown();

  const table = {
    title: "",
    headers: [
      {
        label: "Service",
        property: "nom",
        width: 200,
        valign: "center",
      },
      {
        label: "Taux horaire",
        property: "prix",
        width: 100,
        align: "right",
        valign: "center",
        renderer: (prix) => (prix ? `${formatNumber(prix)} MGA` : ""),
      },
      {
        label: "Estimation",
        property: "heures",
        width: 100,
        align: "right",
        valign: "center",
        renderer: (heures) => (heures ? `${formatNumber(heures)} h` : ""),
      },
      {
        label: "Total (MGA)",
        property: "total",
        width: 100,
        align: "right",
        valign: "center",
        renderer: (total) => `${formatNumber(total)} MGA`,
      },
    ],
    datas: [
      ...devis.services,
      { nom: "Total", total: devis.total, fontFamily: "Helvetica-Bold" },
    ],
  };
  await doc.table(table, {
    padding: 5,
    minRowHeight: 20,
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font("Helvetica").fontSize(12);
    },
  });

  return doc;
};

module.exports = {
  getStatDemandeDevisByStatus,
  getDemandeDevis,
  getDevis,
  getStatDevisByStatus,
  getDevisById,
  generateDevisPDF,
};
