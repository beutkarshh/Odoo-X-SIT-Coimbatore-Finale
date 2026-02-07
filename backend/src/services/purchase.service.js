const { prisma } = require('../config/db');
const { generateNumber } = require('../utils/generateNumber');
const { Prisma } = require('@prisma/client');

// Constants for tax calculation
const GST_PERCENT = 18;
const PLATFORM_FEE = 99;

function toInt(value) {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

/**
 * Create a subscription and invoice for a portal user purchasing a plan
 */
async function purchasePlan({ userId, planId, productId, paymentMethod, couponCode }) {
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

		// Calculate base price
		const basePrice = Number(plan.price);
		
		// Validate and apply coupon if provided
		let discount = null;
		let discountAmount = 0;
		let discountPercent = 0;
		
		if (couponCode) {
			const now = new Date();
			discount = await tx.discount.findFirst({
				where: {
					couponCode: couponCode.toUpperCase(),
					isActive: true,
					startDate: { lte: now },
					OR: [
						{ endDate: null },
						{ endDate: { gte: now } },
					],
				},
			});

			if (discount) {
				// Check usage limit
				if (!discount.usageLimit || discount.usedCount < discount.usageLimit) {
					// Check minimum purchase
					if (!discount.minPurchase || basePrice >= Number(discount.minPurchase)) {
						if (discount.type === 'PERCENTAGE') {
							discountPercent = Number(discount.value);
							discountAmount = (basePrice * discountPercent) / 100;
						} else {
							discountAmount = Math.min(Number(discount.value), basePrice);
							discountPercent = (discountAmount / basePrice) * 100;
						}
						
						// Increment usage count
						await tx.discount.update({
							where: { id: discount.id },
							data: { usedCount: { increment: 1 } },
						});
					}
				}
			}
		}

		// Calculate final amounts
		const priceAfterDiscount = basePrice - discountAmount;
		const taxAmount = (priceAfterDiscount * GST_PERCENT) / 100;
		const totalAmount = priceAfterDiscount + taxAmount + PLATFORM_FEE;

		// Calculate dates
		const startDate = new Date();
		const expirationDate = new Date();
		if (plan.billingPeriod === 'MONTHLY') {
			expirationDate.setMonth(expirationDate.getMonth() + 1);
		} else if (plan.billingPeriod === 'YEARLY') {
			expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		} else if (plan.billingPeriod === 'WEEKLY') {
			expirationDate.setDate(expirationDate.getDate() + 7);
		} else if (plan.billingPeriod === 'DAILY') {
			expirationDate.setDate(expirationDate.getDate() + 1);
		} else {
			expirationDate.setMonth(expirationDate.getMonth() + 1);
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

		// Create invoice with full breakdown
		const invoiceNo = generateNumber('INV');
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 7);

		const invoice = await tx.invoice.create({
			data: {
				invoiceNo,
				status: 'PAID',
				subtotal: new Prisma.Decimal(basePrice),
				taxTotal: new Prisma.Decimal(taxAmount),
				discountTotal: new Prisma.Decimal(discountAmount),
				totalAmount: new Prisma.Decimal(totalAmount),
				total: new Prisma.Decimal(totalAmount),
				couponCode: discount ? discount.couponCode : null,
				discountPercent: discount ? new Prisma.Decimal(discountPercent) : null,
				taxPercent: new Prisma.Decimal(GST_PERCENT),
				platformFee: new Prisma.Decimal(PLATFORM_FEE),
				discountId: discount ? discount.id : null,
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
				discount: true,
			},
		});

		return {
			subscription,
			invoice,
			breakdown: {
				basePrice,
				discountPercent,
				discountAmount,
				priceAfterDiscount,
				taxPercent: GST_PERCENT,
				taxAmount,
				platformFee: PLATFORM_FEE,
				totalAmount,
				couponCode: discount ? discount.couponCode : null,
				couponName: discount ? discount.name : null,
			},
		};
	});
}

module.exports = {
	purchasePlan,
};
