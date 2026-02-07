const purchaseService = require('../services/purchase.service');

async function purchasePlan(req, res, next) {
	try {
		const { planId, productId, paymentMethod } = req.body;
		const userId = req.user.userId;

		const result = await purchaseService.purchasePlan({
			userId,
			planId,
			productId,
			paymentMethod,
		});

		res.status(201).json({
			message: 'Purchase completed successfully',
			subscription: result.subscription,
			invoice: result.invoice,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	purchasePlan,
};
