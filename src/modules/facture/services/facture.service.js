const dayjs = require("dayjs");
const Facture = require("../../../models/Facture");
const PDFDocument = require("pdfkit-table");
const { formatNumber } = require("../../../shared/helpers/number");
const { GARAGE } = require("../../../shared/constants/constant");
const {
  UTILISATEUR_ROLES,
} = require("../../auth/constant/utilisateur.constant");
const Utilisateur = require("../../../models/Utilisateur");
require("dayjs/locale/fr");
dayjs.locale("fr");

const createFacture = async (data) => {
  const facture = new Facture();
  facture.date = dayjs().toDate();
  facture.client = data.client;
  facture.vehicule = data.vehicule;
  facture.details = data.details;
  facture.remise = data.remise;

  facture.ref = `FAC-${dayjs().format("YYYYMMDDHHmmss")}`;

  const total = data.details.reduce((acc, detail) => {
    return (
      acc +
      (detail.prix * detail.heures -
        (detail.prix * detail.heures * detail.remise) / 100)
    );
  }, 0);

  // Appliquer la remise sur le total
  const montantRemise = (total * data.remise) / 100;
  facture.montant = Number((total - montantRemise).toFixed(2));
  // Si la remise est supérieure au total, on met le montant à 0

  if (facture.montant < 0) {
    facture.montant = 0;
  }

  await facture.save();
  return facture;
};

const findAllFactures = async (userRole, userId, page, limit) => {
  const user = await Utilisateur.findOne({ _id: userId });

  const filter =
    userRole === UTILISATEUR_ROLES.manager
      ? {}
      : { "client.email": user.email };
  const factures = await Facture.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Facture.countDocuments(filter);
  return {
    items: factures,
    page,
    limit,
    totalItems: total,
    totalPage: Math.ceil(total / limit),
  };
};

/**
 * Génère un PDF pour une facture
 * @param {*} facture
 * @returns
 */
const generateFacturePDF = async (facture) => {
  console.log(`Génération de la facture ${facture.ref}`);

  const normalFontSize = 12;
  const subTitleFontSize = 18;
  const fontNormal = "Helvetica";
  const fontBold = "Helvetica-Bold";
  const margin = 30;
  const documentWidth = 595;
  const logoWidth = 80;

  const doc = new PDFDocument({ margin: 30, size: "A4" });

  // Logo et en-tête
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

  // Titre du document
  doc
    .font(fontBold)
    .fontSize(22)
    .text(`Facture`, margin, doc.y, { align: "center" });
  doc.moveDown();

  doc.lineGap(3);

  // Informations de la facture
  doc
    .font(fontBold)
    .fontSize(normalFontSize)
    .text("Référence: ", margin, doc.y, { continued: true });
  doc.font(fontNormal).fontSize(normalFontSize).text(facture.ref);
  doc
    .font(fontBold)
    .fontSize(normalFontSize)
    .text("Date: ", { continued: true });
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(dayjs(facture.date).format("DD MMMM YYYY"));

  // Séparateur
  doc.moveDown();
  doc
    .lineWidth(0.5)
    .strokeColor("#87c1ff")
    .moveTo(margin, doc.y)
    .lineTo(documentWidth - margin * 2, doc.y)
    .stroke();
  doc.moveDown();

  // Informations du client
  doc.moveDown(0.5);
  doc.font(fontBold).fontSize(subTitleFontSize).text("Client");
  doc.moveDown(0.5);

  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(`${[facture.client.nom, facture.client.prenom].join(" ")}`);
  doc.font(fontNormal).fontSize(normalFontSize).text(facture.client.email);
  if (facture.client.telephone) {
    doc
      .font(fontNormal)
      .fontSize(normalFontSize)
      .text(facture.client.telephone);
  }

  // Séparateur
  doc.moveDown();
  doc
    .lineWidth(0.5)
    .strokeColor("#87c1ff")
    .moveTo(margin, doc.y)
    .lineTo(documentWidth - margin * 2, doc.y)
    .stroke();
  doc.moveDown();

  // Informations du véhicule
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
    .text(`${facture.vehicule.marque.nom} - ${facture.vehicule.modele}`, {
      lineBreak: true,
    });

  doc.fontSize(normalFontSize).text("Immatriculation: ", { continued: true });
  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(facture.vehicule.immatriculation);

  // Séparateur
  doc.moveDown();
  doc
    .lineWidth(0.5)
    .strokeColor("#87c1ff")
    .moveTo(margin, doc.y)
    .lineTo(documentWidth - margin * 2, doc.y)
    .stroke();
  doc.moveDown();

  // Tableau détaillant les services
  doc.moveDown(0.5);
  doc.font(fontBold).fontSize(subTitleFontSize).text("Prestations facturées");
  doc.moveDown();

  // Calcul du total
  let totalHT = facture.details.reduce((acc, detail) => {
    return (
      acc +
      (detail.prix * detail.heures -
        (detail.prix * detail.heures * detail.remise) / 100)
    );
  }, 0);

  // Préparer les données pour le tableau
  const tableData = facture.details.map((detail) => ({
    designation: detail.designation,
    prix: detail.prix,
    heures: detail.heures,
    total: detail.prix * detail.heures,
    remise: detail.remise,
  }));

  const table = {
    title: "",
    headers: [
      {
        label: "Service",
        property: "designation",
        width: 180,
        valign: "center",
      },
      {
        label: "Taux horaire",
        property: "prix",
        width: 90,
        align: "right",
        valign: "center",
        renderer: (prix) => `${formatNumber(Number(prix))} MGA`,
      },
      {
        label: "Heures",
        property: "heures",
        width: 70,
        align: "right",
        valign: "center",
        renderer: (heures) => `${formatNumber(Number(heures))} h`,
      },
      {
        label: "Total HT",
        property: "total",
        width: 120,
        align: "right",
        valign: "center",
        renderer: (total) => `${formatNumber(Number(total))} MGA`,
      },
      {
        label: "Remise",
        property: "remise",
        width: 70,
        align: "right",
        valign: "center",
        renderer: (remise) => `${formatNumber(Number(remise))} %`,
      },
    ],
    datas: tableData,
  };

  await doc.table(table, {
    padding: 5,
    minRowHeight: 20,
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font("Helvetica").fontSize(12);
    },
  });

  // Récapitulatif des montants
  doc.moveDown();
  const tableWidth = 250;
  const tableX = documentWidth - margin - tableWidth;

  // Créer une table d'alignement à deux colonnes
  const labelWidth = 150;
  const valueWidth = tableWidth - labelWidth;

  // Position verticale de départ pour les lignes du récapitulatif
  let currentY = doc.y;

  // Total HT
  doc
    .font(fontBold)
    .fontSize(normalFontSize)
    .text("Total HT:", tableX, currentY, { width: labelWidth, align: "right" });

  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(`${formatNumber(totalHT)} MGA`, tableX + labelWidth, currentY, {
      width: valueWidth,
      align: "right",
    });

  // Avancer à la ligne suivante
  currentY += normalFontSize + 5;

  // Remise %
  doc
    .font(fontBold)
    .fontSize(normalFontSize)
    .text("Remise:", tableX, currentY, { width: labelWidth, align: "right" });

  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(`${formatNumber(facture.remise)} %`, tableX + labelWidth, currentY, {
      width: valueWidth,
      align: "right",
    });

  // Avancer à la ligne suivante
  currentY += normalFontSize + 5;

  // Montant de la remise
  const montantRemise = (totalHT * facture.remise) / 100;
  doc
    .font(fontBold)
    .fontSize(normalFontSize)
    .text("Montant remise:", tableX, currentY, {
      width: labelWidth,
      align: "right",
    });

  doc
    .font(fontNormal)
    .fontSize(normalFontSize)
    .text(`${formatNumber(montantRemise)} MGA`, tableX + labelWidth, currentY, {
      width: valueWidth,
      align: "right",
    });

  // Avancer à la ligne suivante avec plus d'espacement
  currentY += normalFontSize + 15;

  // Total à payer (plus grand)
  doc
    .font(fontBold)
    .fontSize(normalFontSize + 2)
    .text("Net à payer:", tableX, currentY, {
      width: labelWidth,
      align: "right",
    });

  doc
    .font(fontBold)
    .fontSize(normalFontSize + 2)
    .text(
      `${formatNumber(facture.montant)} MGA`,
      tableX + labelWidth,
      currentY,
      { width: valueWidth, align: "right" }
    );

  // Mentions légales et pieds de page
  doc.moveDown(2);
  doc
    .font(fontNormal)
    .fontSize(10)
    .fillColor("#555555")
    .text(
      "Facture payable à réception. Merci pour votre confiance.",
      margin,
      doc.y,
      {
        align: "left",
        width: documentWidth - margin * 2,
      }
    );

  return doc;
};

/**
 * Génère un stream PDF pour une facture
 * @param {string} id ID de la facture
 * @returns
 */
const generateStreamFacturePDF = async (id) => {
  try {
    const facture = await Facture.findById(id);
    if (!facture) {
      throw new Error("Facture introuvable");
    }

    return await generateFacturePDF(facture);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error;
  }
};

module.exports = {
  createFacture,
  findAllFactures,
  generateFacturePDF,
  generateStreamFacturePDF,
};
