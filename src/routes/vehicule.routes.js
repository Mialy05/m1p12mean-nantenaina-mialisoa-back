const router = require("express").Router();
const {
  UTILISATEUR_ROLES,
} = require("../modules/auth/constant/utilisateur.constant");
const VehiculeController = require("../modules/vehicules/controllers/VehiculeController");
const {
  authorizationMiddleware,
  authMiddleware,
} = require("../shared/middlewares/auth.middleware");

router.get("/", authMiddleware, VehiculeController.findAll);

module.exports = router;
