const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all discounts
 */
async function getAllDiscounts() {
  return prisma.discount.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get active discounts
 */
async function getActiveDiscounts() {
  const now = new Date();
  return prisma.discount.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get discount by ID
 */
async function getDiscountById(id) {
  const discount = await prisma.discount.findUnique({
    where: { id: parseInt(id) },
  });

  if (!discount) {
    const err = new Error('Discount not found');
    err.statusCode = 404;
    throw err;
  }

  return discount;
}

/**
 * Create new discount
 */
async function createDiscount(data) {
  return prisma.discount.create({
    data: {
      name: data.name,
      type: data.type || 'PERCENTAGE',
      value: parseFloat(data.value),
      minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : null,
      minQuantity: data.minQuantity || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      usageLimit: data.usageLimit || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Update discount
 */
async function updateDiscount(id, data) {
  const discount = await prisma.discount.findUnique({
    where: { id: parseInt(id) },
  });

  if (!discount) {
    const err = new Error('Discount not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.discount.update({
    where: { id: parseInt(id) },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type }),
      ...(data.value !== undefined && { value: parseFloat(data.value) }),
      ...(data.minPurchase !== undefined && { minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : null }),
      ...(data.minQuantity !== undefined && { minQuantity: data.minQuantity }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

/**
 * Delete discount
 */
async function deleteDiscount(id) {
  const discount = await prisma.discount.findUnique({
    where: { id: parseInt(id) },
  });

  if (!discount) {
    const err = new Error('Discount not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.discount.delete({
    where: { id: parseInt(id) },
  });
}

/**
 * Increment discount usage count
 */
async function incrementUsage(id) {
  return prisma.discount.update({
    where: { id: parseInt(id) },
    data: {
      usedCount: { increment: 1 },
    },
  });
}

/**
 * Validate a coupon code and return discount details
 * @param {string} couponCode - The coupon code to validate
 * @param {number} purchaseAmount - The amount being purchased (for minPurchase check)
 */
async function validateCoupon(couponCode, purchaseAmount = 0) {
  if (!couponCode) {
    const err = new Error('Coupon code is required');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  
  // Find discount by coupon code
  const discount = await prisma.discount.findFirst({
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

  if (!discount) {
    const err = new Error('Invalid or expired coupon code');
    err.statusCode = 404;
    throw err;
  }

  // Check usage limit
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    const err = new Error('This coupon has reached its usage limit');
    err.statusCode = 400;
    throw err;
  }

  // Check minimum purchase
  if (discount.minPurchase && purchaseAmount < Number(discount.minPurchase)) {
    const err = new Error(`Minimum purchase of ₹${discount.minPurchase} required for this coupon`);
    err.statusCode = 400;
    throw err;
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.type === 'PERCENTAGE') {
    discountAmount = (purchaseAmount * Number(discount.value)) / 100;
  } else {
    discountAmount = Math.min(Number(discount.value), purchaseAmount);
  }

  return {
    id: discount.id,
    name: discount.name,
    couponCode: discount.couponCode,
    type: discount.type,
    value: Number(discount.value),
    discountAmount: Math.round(discountAmount * 100) / 100,
    valid: true,
  };
}

/**
 * Get all available coupons for display (public)
 */
async function getAvailableCoupons() {
  const now = new Date();
  return prisma.discount.findMany({
    where: {
      isActive: true,
      couponCode: { not: null },
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
      OR: [
        { usageLimit: null },
        { usedCount: { lt: prisma.discount.fields.usageLimit } },
      ],
    },
    select: {
      id: true,
      name: true,
      couponCode: true,
      type: true,
      value: true,
      minPurchase: true,
      endDate: true,
    },
    orderBy: { value: 'desc' },
    take: 10,
  });
}

module.exports = {
  getAllDiscounts,
  getActiveDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  incrementUsage,
  validateCoupon,
  getAvailableCoupons,
};
