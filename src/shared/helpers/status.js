const {
  UTILISATEUR_ROLES,
} = require("../../modules/auth/constant/utilisateur.constant");
const { DEMANDE_DEVIS_STATUS, DEVIS_STATUS } = require("../constants/constant");

const getStatusDemandeDevisValues = (role) => {
  if (role == UTILISATEUR_ROLES.client) {
    return DEMANDE_DEVIS_STATUS.client;
  }
  if (role == UTILISATEUR_ROLES.manager) {
    return DEMANDE_DEVIS_STATUS.manager;
  }
};

const getStatusDevisValues = (role) => {
  if (role == UTILISATEUR_ROLES.client) {
    return DEVIS_STATUS.client;
  }
  if (role == UTILISATEUR_ROLES.manager) {
    return DEVIS_STATUS.manager;
  }
};

module.exports = { getStatusDemandeDevisValues, getStatusDevisValues };
