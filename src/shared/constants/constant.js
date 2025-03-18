const PAGINATION_ROW = 10;
const DEMANDE_DEVIS_STATUS = {
  0: "Attente",
  5: "Dispo",
  10: "RDV",
};
const DEVIS_STATUS = {
  "-5": "Supprimé",
  0: "Créé",
  5: "Attente RDV",
  10: "Abouti en RDV",
};

module.exports = {
  PAGINATION_ROW,
  DEMANDE_DEVIS_STATUS,
  DEVIS_STATUS,
};
