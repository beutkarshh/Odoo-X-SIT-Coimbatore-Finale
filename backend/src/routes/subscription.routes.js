const express = require('express');
const subscriptionController = require('../controllers/subscription.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

const staffOnly = [authenticateToken, authorizeRoles('ADMIN', 'INTERNAL')];
const anyAuthed = [authenticateToken];

/**
 * POST /api/subscriptions
 * Create subscription (ADMIN/INTERNAL)
 */
router.post('/', ...staffOnly, subscriptionController.createSubscription);

/**
 * GET /api/subscriptions
 * List subscriptions (PORTAL sees only own)
 */
router.get('/', ...anyAuthed, subscriptionController.listSubscriptions);

/**
 * GET /api/subscriptions/:id
 * Get subscription details (PORTAL sees only own)
 */
router.get('/:id', ...anyAuthed, subscriptionController.getSubscriptionById);

/**
 * PATCH /api/subscriptions/:id/status
 * Update status (ADMIN/INTERNAL)
 */
router.patch('/:id/status', ...staffOnly, subscriptionController.updateSubscriptionStatus);

module.exports = router;


