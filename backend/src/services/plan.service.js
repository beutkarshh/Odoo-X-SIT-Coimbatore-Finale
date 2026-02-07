const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all recurring plans
 * @param {Object} filters - Optional filters
 * @param {number} filters.productId - Filter by product ID
 * @returns {Promise<Array>} List of plans
 */
async function getAllPlans(filters = {}) {
  const where = {};
  if (filters.productId) {
    where.productId = parseInt(filters.productId);
  }
  return prisma.recurringPlan.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get plan by ID
 * @param {number} id - Plan ID
 * @returns {Promise<Object>} Plan data
 */
async function getPlanById(id) {
  const plan = await prisma.recurringPlan.findUnique({
    where: { id: parseInt(id) },
  });

  if (!plan) {
    throw new Error('Plan not found');
  }

  return plan;
}

/**
 * Create new recurring plan
 * @param {Object} data - Plan data
 * @returns {Promise<Object>} Created plan
 */
async function createPlan(data) {
  return prisma.recurringPlan.create({
    data: {
      name: data.name,
      price: parseFloat(data.price),
      billingPeriod: data.billingPeriod,
      minQuantity: data.minQuantity || 1,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      productId: data.productId ? parseInt(data.productId) : null,
      autoClose: data.autoClose !== undefined ? data.autoClose : false,
      closable: data.closable !== undefined ? data.closable : true,
      pausable: data.pausable !== undefined ? data.pausable : false,
      renewable: data.renewable !== undefined ? data.renewable : true,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Update recurring plan
 * @param {number} id - Plan ID
 * @param {Object} data - Updated plan data
 * @returns {Promise<Object>} Updated plan
 */
async function updatePlan(id, data) {
  const plan = await prisma.recurringPlan.findUnique({
    where: { id: parseInt(id) },
  });

  if (!plan) {
    throw new Error('Plan not found');
  }

  return prisma.recurringPlan.update({
    where: { id: parseInt(id) },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.price && { price: parseFloat(data.price) }),
      ...(data.billingPeriod && { billingPeriod: data.billingPeriod }),
      ...(data.minQuantity && { minQuantity: data.minQuantity }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.productId !== undefined && { productId: data.productId ? parseInt(data.productId) : null }),
      ...(data.autoClose !== undefined && { autoClose: data.autoClose }),
      ...(data.closable !== undefined && { closable: data.closable }),
      ...(data.pausable !== undefined && { pausable: data.pausable }),
      ...(data.renewable !== undefined && { renewable: data.renewable }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

/**
 * Delete recurring plan
 * @param {number} id - Plan ID
 * @returns {Promise<Object>} Deleted plan
 */
async function deletePlan(id) {
  const plan = await prisma.recurringPlan.findUnique({
    where: { id: parseInt(id) },
  });

  if (!plan) {
    throw new Error('Plan not found');
  }

  return prisma.recurringPlan.delete({
    where: { id: parseInt(id) },
  });
}

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
