const { prisma } = require('../config/db');
const { Prisma } = require('@prisma/client');

function toInt(value) {
	const n = Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

function toDecimal(value) {
	try {
		return new Prisma.Decimal(value);
	} catch {
		return null;
	}
}

async function createPayment({ invoiceId, amount, method, reference, user }) {
	const invId = toInt(invoiceId);
	const amt = toDecimal(amount);
	const payMethod = method ? String(method).trim().toUpperCase() : 'OTHER';
	const allowed = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER'];

	if (!invId) {
		const err = new Error('invoiceId is required');
		err.statusCode = 400;
		throw err;
	}
	if (!amt || amt.lte(0)) {
		const err = new Error('amount must be a positive number');
		err.statusCode = 400;
		throw err;
	}
	if (!allowed.includes(payMethod)) {
		const err = new Error('Invalid payment method');
		err.statusCode = 400;
		throw err;
	}

	return prisma.$transaction(async (tx) => {
		const invoice = await tx.invoice.findUnique({
			where: { id: invId },
			include: { payments: true },
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

		const payment = await tx.payment.create({
			data: {
				invoiceId: invoice.id,
				amount: amt,
				method: payMethod,
				reference: reference ? String(reference).trim() : null,
			},
		});

		// Recompute paid total
		const payments = await tx.payment.findMany({
			where: { invoiceId: invoice.id },
			select: { amount: true },
		});
		const totalPaid = payments.reduce((acc, p) => acc.plus(p.amount), new Prisma.Decimal(0));
		const fullyPaid = totalPaid.gte(invoice.totalAmount);

		let nextStatus = invoice.status;
		if (fullyPaid) nextStatus = 'PAID';
		else if (invoice.status === 'DRAFT') nextStatus = 'CONFIRMED';

		const updatedInvoice =
			nextStatus !== invoice.status
				? await tx.invoice.update({
					where: { id: invoice.id },
					data: { status: nextStatus },
					include: { payments: true },
				})
				: await tx.invoice.findUnique({ where: { id: invoice.id }, include: { payments: true } });

		return {
			payment,
			invoice: updatedInvoice,
			totalPaid,
		};
	});
}

async function listPayments({ user }) {
	const where = {};
	if (user?.role === 'PORTAL') {
		where.invoice = { customerId: user.userId };
	}

	return prisma.payment.findMany({
		where,
		orderBy: { createdAt: 'desc' },
		include: { invoice: true },
	});
}

module.exports = {
	createPayment,
	listPayments,
};
