const paymentService = require('../services/payment.service');

/**
 * POST /api/payments
 * Record a payment (PORTAL allowed for own invoices)
 */
async function createPayment(req, res, next) {
	try {
		const { invoiceId, amount, method, reference } = req.body || {};
		const result = await paymentService.createPayment({
			invoiceId,
			amount,
			method,
			reference,
			user: req.user,
		});

		return res.status(201).json({
			success: true,
			message: 'Payment recorded successfully',
			data: result,
		});
	} catch (error) {
		next(error);
	}
}

/**
 * GET /api/payments
 * List payments (PORTAL sees only own)
 */
async function listPayments(req, res, next) {
	try {
		const payments = await paymentService.listPayments({ user: req.user });
		return res.status(200).json({ success: true, data: payments });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	createPayment,
	listPayments,
};


