const subscriptionService = require('../services/subscription.service');

/**
 * POST /api/subscriptions
 * Create subscription (ADMIN/INTERNAL)
 */
async function createSubscription(req, res, next) {
	try {
		const created = await subscriptionService.createSubscription(req.body);
		return res.status(201).json({
			success: true,
			message: 'Subscription created successfully',
			data: created,
		});
	} catch (error) {
		next(error);
	}
}

/**
 * GET /api/subscriptions
 * List subscriptions (PORTAL sees only own)
 */
async function listSubscriptions(req, res, next) {
	try {
		const subscriptions = await subscriptionService.listSubscriptions({ user: req.user });
		return res.status(200).json({ success: true, data: subscriptions });
	} catch (error) {
		next(error);
	}
}

/**
 * GET /api/subscriptions/:id
 * Get subscription details (PORTAL sees only own)
 */
async function getSubscriptionById(req, res, next) {
	try {
		const subscription = await subscriptionService.getSubscriptionById({
			id: req.params.id,
			user: req.user,
		});
		return res.status(200).json({ success: true, data: subscription });
	} catch (error) {
		next(error);
	}
}

/**
 * PATCH /api/subscriptions/:id/status
 * Update subscription status (ADMIN/INTERNAL)
 */
async function updateSubscriptionStatus(req, res, next) {
	try {
		const updated = await subscriptionService.updateSubscriptionStatus({
			id: req.params.id,
			status: req.body?.status,
		});
		return res.status(200).json({
			success: true,
			message: 'Subscription status updated',
			data: updated,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	createSubscription,
	listSubscriptions,
	getSubscriptionById,
	updateSubscriptionStatus,
};


