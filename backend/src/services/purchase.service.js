const { prisma } = require('../config/db');
const { generateNumber } = require('../utils/generateNumber');
const { Prisma } = require('@prisma/client');

function toInt(value) {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

/**
 * Create a subscription and invoice for a portal user purchasing a plan
 */
async function purchasePlan({ userId, planId, productId, paymentMethod }) {
	const customerId = toInt(userId);
	const pId = toInt(planId);
	const prodId = toInt(productId);

	if (!customerId || !pId || !prodId) {
		const err = new Error('userId, planId, and productId are required');
		err.statusCode = 400;
		throw err;
	}

	return prisma.$transaction(async (tx) => {
		// Verify customer exists
		const customer = await tx.user.findUnique({ where: { id: customerId } });
		if (!customer) {
			const err = new Error('Customer not found');
			err.statusCode = 404;
			throw err;
		}

		// Verify plan exists and is active
		const plan = await tx.recurringPlan.findUnique({ where: { id: pId } });
		if (!plan || !plan.isActive) {
			const err = new Error('Plan not found or inactive');
			err.statusCode = 404;
			throw err;
		}

		// Verify product exists and is active
		const product = await tx.product.findUnique({ where: { id: prodId } });
		if (!product || !product.isActive) {
			const err = new Error('Product not found or inactive');
			err.statusCode = 404;
			throw err;
		}

		// Calculate dates
		const startDate = new Date();
		const expirationDate = new Date();
		if (plan.billingPeriod === 'Monthly') {
			expirationDate.setMonth(expirationDate.getMonth() + 1);
		} else {
			expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		}

		// Create subscription
		const subscriptionNo = generateNumber('SUB');
		const subscription = await tx.subscription.create({
			data: {
				subscriptionNo,
				startDate,
				expirationDate,
				status: 'ACTIVE',
				customerId,
				planId: pId,
				lines: {
					create: [{
						productId: prodId,
						quantity: 1,
						unitPrice: plan.price,
					}],
				},
			},
			include: {
				customer: { select: { id: true, email: true, name: true, role: true } },
				plan: true,
				lines: { include: { product: true } },
			},
		});

		// Create invoice
		const invoiceNo = generateNumber('INV');
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 7);

		const zero = new Prisma.Decimal(0);
		const invoice = await tx.invoice.create({
			data: {
				invoiceNo,
				status: 'PAID', // Mark as paid since user completed payment
				subtotal: plan.price,
				taxTotal: zero,
				discountTotal: zero,
				totalAmount: plan.price,
				total: plan.price,
				dueDate,
				paidAt: new Date(),
				paymentMethod: paymentMethod || 'card',
				subscriptionId: subscription.id,
				customerId,
			},
			include: {
				subscription: {
					include: {
						customer: { select: { id: true, email: true, name: true, role: true } },
						plan: true,
						lines: { include: { product: true } },
					},
				},
			},
		});

		return {
			subscription,
			invoice,
		};
	});
}

module.exports = {
	purchasePlan,
};
