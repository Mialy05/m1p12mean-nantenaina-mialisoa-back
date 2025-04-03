const router = require("express").Router();

const {
  UTILISATEUR_ROLES,
} = require("../modules/auth/constant/utilisateur.constant");
const DashboardController = require("../modules/dashboard/controllers/DashboardController");
const {
  authorizationMiddleware,
} = require("../shared/middlewares/auth.middleware");
// manager
router.get(
  "/recettes",
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  DashboardController.getRecettes
);
router.get(
  "/intervention-stat",
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  DashboardController.nbrInterventionStat
);
router.get(
  "/devis-rdv-stat",
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  DashboardController.devisRdvStat
);
router.get(
  "/service-stat",
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  DashboardController.moreAskedService
);
router.get(
  "/client-stat",
  authorizationMiddleware([UTILISATEUR_ROLES.manager]),
  DashboardController.clientFidelity
);
// endof manager

// mecanicien

router.get(
  "/intervention-mec-stat",
  authorizationMiddleware([UTILISATEUR_ROLES.mecanicien]),
  DashboardController.interventionOfMechanic
);
router.get(
  "/heure-mec-stat",
  authorizationMiddleware([UTILISATEUR_ROLES.mecanicien]),
  DashboardController.hourWorked
);

router.get(
  "/task-stat",
  authorizationMiddleware([UTILISATEUR_ROLES.mecanicien]),
  DashboardController.taskResume
);
// endof mecanicien
router.get("/test", DashboardController.testDashboard);

module.exports = router;
