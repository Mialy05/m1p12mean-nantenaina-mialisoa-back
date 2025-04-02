const router = require("express").Router();

const DashboardController = require("../modules/dashboard/controllers/DashboardController");

router.get("/recettes", DashboardController.getRecettes);
router.get("/intervention-stat", DashboardController.nbrInterventionStat);
router.get("/devis-rdv-stat", DashboardController.devisRdvStat);
router.get("/service-stat", DashboardController.moreAskedService);
router.get("/client-stat", DashboardController.clientFidelity);
router.get("/test", DashboardController.testDashboard);

module.exports = router;
