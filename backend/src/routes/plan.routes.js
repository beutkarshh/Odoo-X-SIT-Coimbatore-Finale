const express = require('express');
const planController = require('../controllers/plan.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

// Admin-only routes for create, update, delete
const adminOnly = [authenticateToken, authorizeRoles('ADMIN')];

/**
 * GET /api/plans
 * Get all recurring plans - accessible to all authenticated users
 */
router.get('/', authenticateToken, planController.getAllPlans);

/**
 * GET /api/plans/:id
 * Get plan by ID - accessible to all authenticated users
 */
router.get('/:id', authenticateToken, planController.getPlanById);

/**
 * POST /api/plans
 * Create new recurring plan - admin only
 */
router.post('/', ...adminOnly, planController.createPlan);

/**
 * PUT /api/plans/:id
 * Update recurring plan - admin only
 */
router.put('/:id', ...adminOnly, planController.updatePlan);

/**
 * DELETE /api/plans/:id
 * Delete recurring plan - admin only
 */
router.delete('/:id', ...adminOnly, planController.deletePlan);

module.exports = router;

