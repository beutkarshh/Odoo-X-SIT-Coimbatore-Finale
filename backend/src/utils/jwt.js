const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @param {string} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = {
  generateToken,
  verifyToken,
};

