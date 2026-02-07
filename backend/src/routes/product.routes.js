const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

// All product routes require authentication and ADMIN role
const adminOnly = [authenticateToken, authorizeRoles('ADMIN')];

/**
 * GET /api/products
 * Get all products
 */
router.get('/', ...adminOnly, productController.getAllProducts);

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get('/:id', ...adminOnly, productController.getProductById);

/**
 * POST /api/products
 * Create new product
 */
router.post('/', ...adminOnly, productController.createProduct);

/**
 * PUT /api/products/:id
 * Update product
 */
router.put('/:id', ...adminOnly, productController.updateProduct);

/**
 * DELETE /api/products/:id
 * Delete product
 */
router.delete('/:id', ...adminOnly, productController.deleteProduct);

module.exports = router;

