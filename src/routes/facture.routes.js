const router = require("express").Router();
const {
  UTILISATEUR_ROLES,
} = require("../modules/auth/constant/utilisateur.constant");
const FactureController = require("../modules/facture/controllers/FactureController");
const {
  authorizationMiddleware,
} = require("../shared/middlewares/auth.middleware");

router.post(
  "/",
  authorizationMiddleware([
    (UTILISATEUR_ROLES.manager, UTILISATEUR_ROLES.client),
  ]),
  FactureController.createFacture
);
router.get(
  "/",
  authorizationMiddleware([
    (UTILISATEUR_ROLES.manager, UTILISATEUR_ROLES.client),
  ]),
  FactureController.getAllFactures
);
router.get(
  "/:id/pdf",
  authorizationMiddleware([
    (UTILISATEUR_ROLES.manager, UTILISATEUR_ROLES.client),
  ]),
  FactureController.downloadFacturePDF
);

module.exports = router;
