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

authorizationMiddleware([UTILISATEUR_ROLES.manager]);
router.post("/taches/:id/assign", InterventionController.assignTask);

authorizationMiddleware([UTILISATEUR_ROLES.manager]);
router.delete("/taches/:id", InterventionController.deleteTask);

authorizationMiddleware([
  UTILISATEUR_ROLES.manager,
  UTILISATEUR_ROLES.mecanicien,
]);
router.patch("/taches/:id", InterventionController.updateStatus);

module.exports = router;
