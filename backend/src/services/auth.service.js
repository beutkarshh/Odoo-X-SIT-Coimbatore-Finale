const { PrismaClient } = require('@prisma/client');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} User data and JWT token
 * @throws {Error} If credentials are invalid
 */
async function login(email, password) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
      isActive: true,
    },
  });

  // Check if user exists
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is inactive');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Return user data (without password) and token
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    token,
  };
}

/**
 * Get user profile by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User data
 */
async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

module.exports = {
  login,
  getUserProfile,
};

