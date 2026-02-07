const express = require('express');
const reportController = require('../controllers/report.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/dashboard-stats', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'INTERNAL'), 
  reportController.getDashboardStats
);

router.get('/chart-data', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'INTERNAL'), 
  reportController.getChartData
);

module.exports = router;

