const express = require('express');
const planController = require('../controllers/plan.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

// All plan routes require authentication and ADMIN role
const adminOnly = [authenticateToken, authorizeRoles('ADMIN')];

/**
 * GET /api/plans
 * Get all recurring plans
 */
router.get('/', ...adminOnly, planController.getAllPlans);

/**
 * GET /api/plans/:id
 * Get plan by ID
 */
router.get('/:id', ...adminOnly, planController.getPlanById);

/**
 * POST /api/plans
 * Create new recurring plan
 */
router.post('/', ...adminOnly, planController.createPlan);

/**
 * PUT /api/plans/:id
 * Update recurring plan
 */
router.put('/:id', ...adminOnly, planController.updatePlan);

/**
 * DELETE /api/plans/:id
 * Delete recurring plan
 */
router.delete('/:id', ...adminOnly, planController.deletePlan);

module.exports = router;

