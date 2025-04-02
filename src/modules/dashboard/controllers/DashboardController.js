const dayjs = require("dayjs");
const ApiResponse = require("../../../shared/types/ApiResponse");
const {
  findRecettes,
  nbrInterventionStat,
  findDevisRdvStats,
  findMoreAskedTask,
  findClientFidelity,
  nbrInterventionOfMechanic,
  findHourWorked,
  findCountTaskByStatusOfMechanic,
  findMoreAskedService,
} = require("../services/dashboard.service");
const { default: mongoose } = require("mongoose");

class DashboardController {
  static async getRecettes(req, res) {
    try {
      const monthlyRecette = await findRecettes(
        dayjs().startOf("year"),
        dayjs().endOf("year")
      );
      const recetteOfActualMonth = await findRecettes(
        dayjs().startOf("month"),
        dayjs().endOf("month")
      );
      for (let month = 0; month < 12; month++) {
        if (monthlyRecette.some((recette) => recette._id.month === month + 1)) {
          continue;
        } else {
          monthlyRecette.push({
            _id: {
              month: month + 1,
              year: dayjs().year(),
            },
            total: 0,
          });
        }
      }
      monthlyRecette.sort((a, b) => a._id.month - b._id.month);
      res.json(
        ApiResponse.success({
          monthlyRecette,
          recetteOfActualMonth: recetteOfActualMonth[0]?.total || 0,
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async nbrInterventionStat(req, res) {
    try {
      const data = await nbrInterventionStat(
        dayjs().startOf("month"),
        dayjs().endOf("month")
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async devisRdvStat(req, res) {
    try {
      const data = await findDevisRdvStats(
        dayjs().startOf("month"),
        dayjs().endOf("month")
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async moreAskedService(req, res) {
    try {
      const data = await findMoreAskedService(
        dayjs().startOf("month"),
        dayjs().endOf("month")
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async clientFidelity(req, res) {
    try {
      const data = await findClientFidelity(
        dayjs().startOf("month"),
        dayjs().endOf("month")
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async testDashboard(req, res) {
    try {
      const data = await findCountTaskByStatusOfMechanic(
        new mongoose.Types.ObjectId("67e8500ee5f826a5a01a1527"),
        dayjs().startOf("month"),
        dayjs().endOf("month")
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
}

module.exports = DashboardController;
