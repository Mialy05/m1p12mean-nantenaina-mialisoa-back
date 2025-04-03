const {
  UTILISATEUR_ROLES,
} = require("../../modules/auth/constant/utilisateur.constant");
const { phoneRegex } = require("../constants/validation");

const isValidRole = (role) => Object.values(UTILISATEUR_ROLES).includes(role);

const validateUtilisateurData = (data) => {
  const errors = [];

  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("L' email est obligatoire.");
  }

  if (!data.pwd || typeof data.pwd !== "string" || !data.pwd.trim()) {
    errors.push("Le mot de passe est obligatoire.");
  } else if (data.pwd.length < 6) {
    errors.push("Le mot de passe doit contenir au moins 6 caractères.");
  }

  if (!data.nom || typeof data.nom !== "string" || !data.nom.trim()) {
    errors.push("Le nom est obligatoire.");
  }

  if (!data.prenom || typeof data.prenom !== "string") {
    errors.push("Le prénom est obligatoire.");
  }

  if (!data.role || typeof data.role !== "string" || !data.role.trim()) {
    errors.push("Le role est obligatoire.");
  } else if (!isValidRole(data.role)) {
    errors.push("Le role n'est pas valide.");
  }

  if (
    !data.telephone ||
    typeof data.telephone !== "string" ||
    !data.telephone.trim()
  ) {
    errors.push("Le téléphone est obligatoire");
  } else if (!phoneRegex.test(data.telephone)) {
    errors.push("Le téléphone n'est pas valide");
  }

  return errors.length > 0 ? errors : null;
};

const parseMongoDBError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return `La valeur '${value}' pour le champ '${field}' est déjà utilisée.`;
  } else {
    return error;
  }
};
module.exports = { validateUtilisateurData, parseMongoDBError };
