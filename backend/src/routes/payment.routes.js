const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * POST /api/payments
 */
router.post('/', authenticateToken, paymentController.createPayment);

/**
 * GET /api/payments
 */
router.get('/', authenticateToken, paymentController.listPayments);

module.exports = router;


