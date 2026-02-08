const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

const allAuthenticated = [authenticateToken];

/**
 * GET /api/notifications
 */
router.get('/', ...allAuthenticated, notificationController.list);

/**
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', ...allAuthenticated, notificationController.unreadCount);

/**
 * POST /api/notifications/read-all
 */
router.post('/read-all', ...allAuthenticated, notificationController.markAllRead);

/**
 * POST /api/notifications/:id/read
 */
router.post('/:id/read', ...allAuthenticated, notificationController.markRead);

module.exports = router;
