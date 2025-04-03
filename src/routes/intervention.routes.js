const {
  UTILISATEUR_ROLES,
} = require("../modules/auth/constant/utilisateur.constant");
const InterventionController = require("../modules/interventions/controllers/InterventionController");
const {
  authorizationMiddleware,
  authMiddleware,
} = require("../shared/middlewares/auth.middleware");

const router = require("express").Router();

// TODO: manager sy meca ihany
router.get("/", authorizationMiddleware(["*"]), InterventionController.findAll);
router.get(
  "/:id",
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  InterventionController.findById
);

router.get("/:id/taches", authMiddleware, InterventionController.findAllTaches);

router.post(
  "/taches/:id/assign",
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  InterventionController.assignTask
);

router.delete(
  "/taches/:id",
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  InterventionController.deleteTask
);
router.patch(
  "/taches/:id",
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  InterventionController.updateStatus
);

router.patch(
  "/taches/:id",
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  InterventionController.updateStatus
);

router.get(
  "/taches/:id/comments",
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  InterventionController.findCommentsOfTache
);
router.post(
  "/taches/:id/comments",
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  InterventionController.commentTask
);

router.post(
  "/:id/taches",
  authorizationMiddleware([UTILISATEUR_ROLES.client]),
  InterventionController.addTache
);
router.get(
  "/:id/services",
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  InterventionController.getServicesInIntervention
);
module.exports = router;
