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

const DEVIS_CREATED = 0;
const DEVIS_WAIT_RDV = 5;
const DEVIS_RDV = 10;
const DEVIS_DELETED = -5;

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

const TACHE_STATUS = {
  "-5": "Supprimer",
  0: "A faire",
  5: "En cours",
  10: "Terminé",
};

const DELETED_INTERVENTION_STATUS = -5;
const CREATED_INTERVENTION_STATUS = 0;

module.exports = {
  PAGINATION_ROW,
  DEMANDE_DEVIS_STATUS,
  DEVIS_STATUS,
  DEVIS_CREATED,
  DEVIS_WAIT_RDV,
  DEVIS_RDV,
  DEVIS_DELETED,
  GARAGE,
  TACHE_STATUS,
  DELETED_INTERVENTION_STATUS,
  CREATED_INTERVENTION_STATUS,
};
