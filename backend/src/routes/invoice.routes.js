const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

const staffOnly = [authenticateToken, authorizeRoles('ADMIN', 'INTERNAL')];
const anyAuthed = [authenticateToken];

/**
 * POST /api/invoices/generate
 */
router.post('/generate', ...staffOnly, invoiceController.generateForSubscription);

/**
 * GET /api/invoices
 */
router.get('/', ...anyAuthed, invoiceController.listInvoices);

/**
 * GET /api/invoices/:id
 */
router.get('/:id', ...anyAuthed, invoiceController.getInvoiceById);

/**
 * PATCH /api/invoices/:id/status
 */
router.patch('/:id/status', ...staffOnly, invoiceController.updateInvoiceStatus);

module.exports = router;


