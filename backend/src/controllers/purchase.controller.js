const purchaseService = require('../services/purchase.service');

async function purchasePlan(req, res, next) {
	try {
		const { planId, productId, paymentMethod, couponCode } = req.body;
		const userId = req.user.userId;

		const result = await purchaseService.purchasePlan({
			userId,
			planId,
			productId,
			paymentMethod,
			couponCode,
		});

		res.status(201).json({
			success: true,
			message: 'Purchase completed successfully',
			data: {
				subscription: result.subscription,
				invoice: result.invoice,
				breakdown: result.breakdown,
			},
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	purchasePlan,
};
