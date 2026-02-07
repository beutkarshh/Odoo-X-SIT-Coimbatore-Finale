const invoiceService = require('../services/invoice.service');

/**
 * POST /api/invoices/generate
 * Generate a draft invoice from a subscription (ADMIN/INTERNAL)
 */
async function generateForSubscription(req, res, next) {
	try {
		const { subscriptionId, dueDate } = req.body || {};
		const created = await invoiceService.generateForSubscription({ subscriptionId, dueDate });
		return res.status(201).json({
			success: true,
			message: 'Invoice generated successfully',
			data: created,
		});
	} catch (error) {
		next(error);
	}
}

/**
 * GET /api/invoices
 * List invoices (PORTAL sees only own)
 */
async function listInvoices(req, res, next) {
	try {
		const invoices = await invoiceService.listInvoices({ user: req.user });
		return res.status(200).json({ success: true, data: invoices });
	} catch (error) {
		next(error);
	}
}

/**
 * GET /api/invoices/:id
 * Get invoice by id (PORTAL sees only own)
 */
async function getInvoiceById(req, res, next) {
	try {
		const invoice = await invoiceService.getInvoiceById({ id: req.params.id, user: req.user });
		return res.status(200).json({ success: true, data: invoice });
	} catch (error) {
		next(error);
	}
}

/**
 * PATCH /api/invoices/:id/status
 * Update invoice status (ADMIN/INTERNAL)
 */
async function updateInvoiceStatus(req, res, next) {
	try {
		const updated = await invoiceService.updateInvoiceStatus({
			id: req.params.id,
			status: req.body?.status,
		});
		return res.status(200).json({
			success: true,
			message: 'Invoice status updated',
			data: updated,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	generateForSubscription,
	listInvoices,
	getInvoiceById,
	updateInvoiceStatus,
};


