const { prisma } = require('../config/db');
const { generateNumber } = require('../utils/generateNumber');

function toInt(value) {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

async function createSubscription(payload) {
	const customerId = toInt(payload?.customerId);
	const planId = toInt(payload?.planId);
	const startDate = payload?.startDate ? new Date(payload.startDate) : null;
	const expirationDate = payload?.expirationDate ? new Date(payload.expirationDate) : null;
	const paymentTerms = payload?.paymentTerms ? String(payload.paymentTerms).trim() : null;
	const lines = Array.isArray(payload?.lines) ? payload.lines : [];

	if (!customerId || !planId || !startDate || Number.isNaN(startDate.getTime())) {
		const err = new Error('customerId, planId, and startDate are required');
		err.statusCode = 400;
		throw err;
	}

	if (expirationDate && Number.isNaN(expirationDate.getTime())) {
		const err = new Error('expirationDate must be a valid date');
		err.statusCode = 400;
		throw err;
	}

	if (!Array.isArray(lines) || lines.length === 0) {
		const err = new Error('At least one subscription line is required');
		err.statusCode = 400;
		throw err;
	}

	return prisma.$transaction(async (tx) => {
		const customer = await tx.user.findUnique({ where: { id: customerId } });
		if (!customer) {
			const err = new Error('Customer not found');
			err.statusCode = 404;
			throw err;
		}

		const plan = await tx.recurringPlan.findUnique({ where: { id: planId } });
		if (!plan || !plan.isActive) {
			const err = new Error('Plan not found or inactive');
			err.statusCode = 404;
			throw err;
		}

		const subscriptionNo = generateNumber('SUB');

		// Fetch products up-front so we can default unitPrice.
		const productIds = lines.map((l) => toInt(l?.productId)).filter((id) => Number.isFinite(id));
		if (productIds.length !== lines.length) {
			const err = new Error('Each line must include a valid productId');
			err.statusCode = 400;
			throw err;
		}

		const products = await tx.product.findMany({
			where: { id: { in: productIds } },
			select: { id: true, salesPrice: true, isActive: true },
		});
		const productById = new Map(products.map((p) => [p.id, p]));

		for (const id of productIds) {
			const p = productById.get(id);
			if (!p) {
				const err = new Error(`Product not found: ${id}`);
				err.statusCode = 404;
				throw err;
			}
			if (!p.isActive) {
				const err = new Error(`Product inactive: ${id}`);
				err.statusCode = 400;
				throw err;
			}
		}

		const created = await tx.subscription.create({
			data: {
				subscriptionNo,
				startDate,
				expirationDate,
				paymentTerms,
				customerId,
				planId,
				lines: {
					create: lines.map((l) => {
						const productId = toInt(l.productId);
						const quantity = toInt(l?.quantity) || 1;
						const unitPrice =
							typeof l?.unitPrice !== 'undefined' && l?.unitPrice !== null
								? l.unitPrice
								: productById.get(productId).salesPrice;

						if (!quantity || quantity < 1) {
							const err = new Error('Line quantity must be >= 1');
							err.statusCode = 400;
							throw err;
						}

						return {
							productId,
							quantity,
							unitPrice,
						};
					}),
				},
			},
			include: {
				customer: { select: { id: true, email: true, name: true, role: true } },
				plan: true,
				lines: { include: { product: true } },
			},
		});

		return created;
	});
}

async function listSubscriptions({ user }) {
	const where = {};
	if (user?.role === 'PORTAL') {
		where.customerId = user.userId;
	}

	return prisma.subscription.findMany({
		where,
		orderBy: { createdAt: 'desc' },
		include: {
			customer: { select: { id: true, email: true, name: true, role: true } },
			plan: true,
			lines: { include: { product: true } },
		},
	});
}

async function getSubscriptionById({ id, user }) {
	const subId = toInt(id);
	if (!subId) {
		const err = new Error('Invalid subscription id');
		err.statusCode = 400;
		throw err;
	}

	const subscription = await prisma.subscription.findUnique({
		where: { id: subId },
		include: {
			customer: { select: { id: true, email: true, name: true, role: true } },
			plan: true,
			lines: { include: { product: true } },
			invoices: { include: { payments: true } },
		},
	});

	if (!subscription) {
		const err = new Error('Subscription not found');
		err.statusCode = 404;
		throw err;
	}

	if (user?.role === 'PORTAL' && subscription.customerId !== user.userId) {
		const err = new Error('Forbidden');
		err.statusCode = 403;
		throw err;
	}

	return subscription;
}

async function updateSubscriptionStatus({ id, status }) {
	const subId = toInt(id);
	const nextStatus = String(status || '').trim().toUpperCase();
	const allowed = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'];

	if (!subId) {
		const err = new Error('Invalid subscription id');
		err.statusCode = 400;
		throw err;
	}
	if (!allowed.includes(nextStatus)) {
		const err = new Error('Invalid status');
		err.statusCode = 400;
		throw err;
	}

	try {
		return await prisma.subscription.update({
			where: { id: subId },
			data: { status: nextStatus },
		});
	} catch {
		const err = new Error('Subscription not found');
		err.statusCode = 404;
		throw err;
	}
}

module.exports = {
	createSubscription,
	listSubscriptions,
	getSubscriptionById,
	updateSubscriptionStatus,
};
