const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @param {string} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = '7d') {
  if (!env.JWT_SECRET) {
    const err = new Error('Server misconfigured: JWT_SECRET is not set');
    err.statusCode = 500;
    throw err;
  }
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
    if (!env.JWT_SECRET) {
      const err = new Error('Server misconfigured: JWT_SECRET is not set');
      err.statusCode = 500;
      throw err;
    }
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    throw err;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};

