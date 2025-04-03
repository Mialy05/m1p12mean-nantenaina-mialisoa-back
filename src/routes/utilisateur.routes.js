const UtilisateurController = require("../modules/utilisateur/controllers/utilisateurController");
const {
  UTILISATEUR_ROLES,
} = require("../modules/auth/constant/utilisateur.constant");
const {
  authorizationMiddleware,
  authMiddleware,
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

router.post(`/inscription`, UtilisateurController.inscriptionUser);

// TODO: mnola miditra ao am controller ihany na d mi failed ary lay middleware
router.post(
  `/mecaniciens/inscription`,
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  UtilisateurController.inscriptionMecano
);

module.exports = router;
