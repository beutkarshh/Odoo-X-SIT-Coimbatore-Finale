const express = require('express');
const purchaseController = require('../controllers/purchase.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * POST /api/purchase
 * Portal user purchases a subscription plan
 */
router.post(
	'/',
	authenticateToken,
	authorizeRoles('PORTAL'),
	purchaseController.purchasePlan
);

module.exports = router;
