const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("authorization").split("Bearer ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id && decoded.role) {
      req.userId = decoded.id;
      req.userRole = decoded.role;
      console.log("connected user", req.userId, "role", req.userRole);
      next();
    } else {
      throw new Error("401");
    }
  } catch (e) {
    console.log(e);

    res.status(401).send({ isError: true, message: "Connexion requise" });
  }
};

module.exports = authMiddleware;
