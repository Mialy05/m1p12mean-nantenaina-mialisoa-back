const {
  UTILISATEUR_ROLES,
} = require("../modules/auth/constant/utilisateur.constant");
const InterventionController = require("../modules/interventions/controllers/InterventionController");
const {
  authorizationMiddleware,
} = require("../shared/middlewares/auth.middleware");

const router = require("express").Router();

router.get("/", authorizationMiddleware(["*"]), InterventionController.findAll);
router.get(
  "/:id",
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  InterventionController.findById
);

router.get("/:id/taches", InterventionController.findAllTaches);

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

router.get("/taches/:id/comments", InterventionController.findCommentsOfTache);
router.post("/taches/:id/comments", InterventionController.commentTask);

module.exports = router;
