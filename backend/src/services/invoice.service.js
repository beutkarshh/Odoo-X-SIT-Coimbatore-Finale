const { prisma } = require('../config/db');
const { generateNumber } = require('../utils/generateNumber');
const { Prisma } = require('@prisma/client');

function toInt(value) {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

function addDays(date, days) {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

async function generateForSubscription({ subscriptionId, dueDate }) {
	const subId = toInt(subscriptionId);
	if (!subId) {
		const err = new Error('subscriptionId is required');
		err.statusCode = 400;
		throw err;
	}

	const parsedDue = dueDate ? new Date(dueDate) : addDays(new Date(), 7);
	if (Number.isNaN(parsedDue.getTime())) {
		const err = new Error('dueDate must be a valid date');
		err.statusCode = 400;
		throw err;
	}

	return prisma.$transaction(async (tx) => {
		const subscription = await tx.subscription.findUnique({
			where: { id: subId },
			include: { lines: true },
		});

		if (!subscription) {
			const err = new Error('Subscription not found');
			err.statusCode = 404;
			throw err;
		}

		if (!subscription.lines || subscription.lines.length === 0) {
			const err = new Error('Cannot invoice a subscription with no lines');
			err.statusCode = 400;
			throw err;
		}

		const zero = new Prisma.Decimal(0);
		const subtotal = subscription.lines.reduce((acc, line) => {
			const qty = new Prisma.Decimal(line.quantity || 0);
			return acc.plus(line.unitPrice.mul(qty));
		}, zero);

		const invoiceNo = generateNumber('INV');
		const created = await tx.invoice.create({
			data: {
				invoiceNo,
				status: 'DRAFT',
				subtotal,
				taxTotal: zero,
				discountTotal: zero,
				totalAmount: subtotal,
				dueDate: parsedDue,
				subscriptionId: subscription.id,
				customerId: subscription.customerId,
			},
			include: { payments: true },
		});

		return created;
	});
}

async function listInvoices({ user }) {
	const where = {};
	if (user?.role === 'PORTAL') {
		where.customerId = user.userId;
	}

	return prisma.invoice.findMany({
		where,
		orderBy: { createdAt: 'desc' },
		include: { payments: true, subscription: true },
	});
}

async function getInvoiceById({ id, user }) {
	const invoiceId = toInt(id);
	if (!invoiceId) {
		const err = new Error('Invalid invoice id');
		err.statusCode = 400;
		throw err;
	}

	const invoice = await prisma.invoice.findUnique({
		where: { id: invoiceId },
		include: { payments: true, subscription: true },
	});

	if (!invoice) {
		const err = new Error('Invoice not found');
		err.statusCode = 404;
		throw err;
	}

	if (user?.role === 'PORTAL' && invoice.customerId !== user.userId) {
		const err = new Error('Forbidden');
		err.statusCode = 403;
		throw err;
	}

	return invoice;
}

async function updateInvoiceStatus({ id, status }) {
	const invoiceId = toInt(id);
	const nextStatus = String(status || '').trim().toUpperCase();
	const allowed = ['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED'];

	if (!invoiceId) {
		const err = new Error('Invalid invoice id');
		err.statusCode = 400;
		throw err;
	}
	if (!allowed.includes(nextStatus)) {
		const err = new Error('Invalid status');
		err.statusCode = 400;
		throw err;
	}

	try {
		return await prisma.invoice.update({
			where: { id: invoiceId },
			data: { status: nextStatus },
			include: { payments: true },
		});
	} catch {
		const err = new Error('Invoice not found');
		err.statusCode = 404;
		throw err;
	}
}

module.exports = {
	generateForSubscription,
	listInvoices,
	getInvoiceById,
	updateInvoiceStatus,
};

