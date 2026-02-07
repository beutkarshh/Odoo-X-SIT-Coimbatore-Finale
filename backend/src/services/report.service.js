const { prisma } = require('../config/db');
const { SubscriptionStatus, InvoiceStatus } = require('@prisma/client');

exports.getDashboardStats = async () => {
  const [totalProducts, activeSubscriptions, paidInvoices, pendingInvoices] = await Promise.all([
    prisma.product.count(),
    prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
    prisma.invoice.findMany({
      where: { status: InvoiceStatus.PAID },
      select: { total: true }
    }),
    prisma.invoice.count({ where: { status: { not: InvoiceStatus.PAID } } })
  ]);

  const monthlyRevenue = paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

  return {
    totalProducts,
    activeSubscriptions,
    monthlyRevenue,
    pendingInvoices
  };
};

