const jwt = require("jsonwebtoken");
const ApiResponse = require("../types/ApiResponse");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("authorization").split("Bearer ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id && decoded.role) {
      req.query.userId = decoded.id;
      req.query.userRole = decoded.role;
      console.log(
        "connected user",
        req.query.userId,
        "role",
        req.query.userRole
      );
      next();
    } else {
      throw new Error("401");
    }
  } catch (e) {
    console.log(e);

    res.status(401).send({ isError: true, message: "Connexion requise" });
  }
};

const authorizationMiddleware = (roles) => (req, res, next) => {
  if (req.query.userRole) {
    if (roles.includes("*") || roles.includes(req.query.userRole)) {
      next();
    } else {
      return res
        .status(403)
        .json(ApiResponse.error(`Action interdite pour votre profil`));
    }
  } else {
    next(authMiddleware, authorizationMiddleware);
  }
};

module.exports = { authMiddleware, authorizationMiddleware };
