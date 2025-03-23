const PAGINATION_ROW = 10;
const DEMANDE_DEVIS_STATUS = {
  0: "Attente",
  5: "Dispo",
  10: "RDV",
};

const DEVIS_CREATED = 0;
const DEVIS_WAIT_RDV = 5;
const DEVIS_RDV = 10;
const DEVIS_DELETED = -5;

const DEVIS_STATUS = {
  "-5": "Supprimé",
  0: "Créé",
  5: "Attente RDV",
  10: "Abouti en RDV",
};
const GARAGE = {
  nom: "Garaz'nay",
  adresse: "Ambatobe",
  telephone: "034 11 111 11",
  email: "test@test.com",
};

module.exports = {
  PAGINATION_ROW,
  DEMANDE_DEVIS_STATUS,
  DEVIS_STATUS,
  DEVIS_CREATED,
  DEVIS_WAIT_RDV,
  DEVIS_RDV,
  DEVIS_DELETED,
  GARAGE,
};
