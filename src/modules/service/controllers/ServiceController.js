const ApiResponse = require("../../../shared/types/ApiResponse");
const { findAllServices } = require("../services/service.service");

class ServiceController {
  static async findAll(req, res) {
    try {
      const services = await findAllServices();
      res.status(200).send(ApiResponse.success(services));
    } catch (error) {
      res.status(500).send(ApiResponse.error("Une erreur est survenue", error));
      console.log(error);
    }
  }
}

module.exports = ServiceController;
