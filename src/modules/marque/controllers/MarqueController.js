const { findAllMarque } = require("../services/marque.service");

class MarqueController {
  static async findAll(req, res) {
    try {
      const marques = await findAllMarque();
      return res.status(200).send(marques);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  }
}

module.exports = MarqueController;
