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
const { DATE_FILTER_FORMAT } = require("../../../shared/constants/constant");

// TODO: handle string vide

const defaultStart = dayjs().startOf("month").format(DATE_FILTER_FORMAT);
const defaultEnd = dayjs().endOf("month").format(DATE_FILTER_FORMAT);

class DashboardController {
  static async getRecettes(req, res) {
    // format DD-MM-YYYY
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    console.log(end);

    try {
      const monthlyRecette = await findRecettes(
        dayjs(start).startOf("year") || defaultStart,
        dayjs(start).endOf("year") || defaultEnd
      );
      const recetteOfActualMonth = await findRecettes(
        start || defaultStart,
        end || defaultEnd
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
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    try {
      const data = await nbrInterventionStat(
        start || defaultStart,
        end || defaultEnd
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async devisRdvStat(req, res) {
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    try {
      const data = await findDevisRdvStats(
        start || defaultStart,
        end || defaultEnd
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async moreAskedService(req, res) {
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    try {
      const data = await findMoreAskedService(
        start || defaultStart,
        end || defaultEnd
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async clientFidelity(req, res) {
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    try {
      const data = await findClientFidelity(
        start || defaultStart,
        end || defaultEnd
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async interventionOfMechanic(req, res) {
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    try {
      const data = await nbrInterventionOfMechanic(
        new mongoose.Types.ObjectId(req.query.userId),
        start || defaultStart,
        end || defaultEnd
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async hourWorked(req, res) {
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    try {
      const data = await findHourWorked(
        new mongoose.Types.ObjectId(req.query.userId),
        start || defaultStart,
        end || defaultEnd
      );
      res.json(ApiResponse.success({ heures: data }));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async taskResume(req, res) {
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    try {
      const data = await findCountTaskByStatusOfMechanic(
        new mongoose.Types.ObjectId(req.query.userId),
        start || defaultStart,
        end || defaultEnd
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }

  static async testDashboard(req, res) {
    const {
      start = dayjs().startOf("month").format(DATE_FILTER_FORMAT),
      end = dayjs().endOf("month").format(DATE_FILTER_FORMAT),
    } = req.query;
    try {
      const data = await findCountTaskByStatusOfMechanic(
        new mongoose.Types.ObjectId("67e8500ee5f826a5a01a1527"),
        start || defaultStart,
        end || defaultEnd
      );
      res.json(ApiResponse.success(data));
    } catch (error) {
      console.log(error);
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
}

module.exports = DashboardController;
