const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

// Admin-only routes for create, update, delete
const adminOnly = [authenticateToken, authorizeRoles('ADMIN')];

/**
 * GET /api/products
 * Get all products - accessible to all authenticated users
 */
router.get('/', authenticateToken, productController.getAllProducts);

/**
 * GET /api/products/:id
 * Get product by ID - accessible to all authenticated users
 */
router.get('/:id', authenticateToken, productController.getProductById);

/**
 * POST /api/products
 * Create new product - admin only
 */
router.post('/', ...adminOnly, productController.createProduct);

/**
 * PUT /api/products/:id
 * Update product - admin only
 */
router.put('/:id', ...adminOnly, productController.updateProduct);

/**
 * DELETE /api/products/:id
 * Delete product - admin only
 */
router.delete('/:id', ...adminOnly, productController.deleteProduct);

module.exports = router;

