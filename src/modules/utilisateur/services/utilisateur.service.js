const Utilisateur = require("../../../models/Utilisateur");
const {
  UTILISATEUR_STATUS,
} = require("../../auth/constant/utilisateur.constant");

const findAllUtilisateurs = async (roles) => {
  let filter = { status: UTILISATEUR_STATUS.active };

  if (roles) {
    if (Array.isArray(roles) && roles.length > 0) {
      filter = {
        ...filter,
        role: { $in: roles },
      };
    } else if (!Array.isArray(roles)) {
      filter = {
        ...filter,
        role: roles,
      };
    }
  }

  return await Utilisateur.find(filter, { pwd: 0 });
};

module.exports = { findAllUtilisateurs };
