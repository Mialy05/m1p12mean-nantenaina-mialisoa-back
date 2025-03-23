const PAGINATION_ROW = 10;
const DEMANDE_DEVIS_STATUS = {
  client: {
    0: "Attente",
    5: "Dispo",
  },
  manager: {
    0: "Attente de réponse",
    5: "Répondu",
  },
};
const DEVIS_STATUS = {
  client: {
    "-5": "Supprimé",
    0: "Créé",
    5: "Attente RDV",
    10: "Abouti en RDV",
  },
  manager: {
    "-5": "Supprimé",
    0: "Créé",
    5: "RDV à confirmer",
    10: "Abouti en RDV",
  },
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
  GARAGE,
};
