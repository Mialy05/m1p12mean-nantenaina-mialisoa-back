const UtilisateurController = require("../modules/utilisateur/controllers/utilisateurController");
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

router.get(
  `/mecaniciens`,
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  UtilisateurController.findAllPaginatedMecano
);

router.get(
  `/:id/taches`,
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  UtilisateurController.findAllTacheOfMecanicien
);

module.exports = router;
