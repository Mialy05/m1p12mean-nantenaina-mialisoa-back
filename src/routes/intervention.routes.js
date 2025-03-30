const {
  UTILISATEUR_ROLES,
} = require("../modules/auth/constant/utilisateur.constant");
const InterventionController = require("../modules/interventions/controllers/InterventionController");
const {
  authorizationMiddleware,
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

router.get("/:id/taches", InterventionController.findAllTaches);

authorizationMiddleware([UTILISATEUR_ROLES.manager]);
router.post("/taches/:id/assign", InterventionController.assignTask);

authorizationMiddleware([UTILISATEUR_ROLES.manager]);
router.delete(
  "/taches/:id",
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  InterventionController.deleteTask
);
router.patch("/taches/:id", InterventionController.updateStatus);
authorizationMiddleware([
  UTILISATEUR_ROLES.manager,
  UTILISATEUR_ROLES.mecanicien,
]);

router.post("/:id/taches", InterventionController.addTache);
router.get(
  "/:id/services",
  authorizationMiddleware([
    UTILISATEUR_ROLES.manager,
    UTILISATEUR_ROLES.mecanicien,
  ]),
  InterventionController.getServicesInIntervention
);
module.exports = router;
