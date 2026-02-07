const authService = require('../services/auth.service');

/**
 * POST /api/auth/login
 * Login with email and password
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Attempt login
    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    // Pass error to error middleware
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current user profile
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.userId;

    const user = await authService.getUserProfile(userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getMe,
};

