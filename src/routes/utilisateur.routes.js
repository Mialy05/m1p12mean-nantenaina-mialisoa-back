const UtilisateurController = require("../modules/utilisateur/controllers/utilisateur.controller");
const {
  UTILISATEUR_ROLES,
} = require("../modules/auth/constant/utilisateur.constant");
const {
  authorizationMiddleware,
} = require("../shared/middlewares/auth.middleware");
const router = require("express").Router();

router.get(
  ``,
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  UtilisateurController.findAll
);

module.exports = router;
