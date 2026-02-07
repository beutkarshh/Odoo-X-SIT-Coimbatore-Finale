const reportService = require('../services/report.service');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

