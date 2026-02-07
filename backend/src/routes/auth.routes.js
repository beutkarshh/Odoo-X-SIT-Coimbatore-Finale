const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;

