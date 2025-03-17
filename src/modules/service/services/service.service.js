const Service = require("../../../models/Service");

const findAllServices = async () => {
  const services = await Service.find();
  return services;
};

module.exports = {
  findAllServices,
};
