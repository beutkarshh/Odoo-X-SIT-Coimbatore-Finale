const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all products
 * @returns {Promise<Array>} List of products
 */
async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {Promise<Object>} Product data
 */
async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

/**
 * Create new product
 * @param {Object} data - Product data
 * @returns {Promise<Object>} Created product
 */
async function createProduct(data) {
  return prisma.product.create({
    data: {
      name: data.name,
      type: data.type,
      salesPrice: parseFloat(data.salesPrice),
      costPrice: parseFloat(data.costPrice),
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

/**
 * Update product
 * @param {number} id - Product ID
 * @param {Object} data - Updated product data
 * @returns {Promise<Object>} Updated product
 */
async function updateProduct(id, data) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type }),
      ...(data.salesPrice && { salesPrice: parseFloat(data.salesPrice) }),
      ...(data.costPrice && { costPrice: parseFloat(data.costPrice) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

/**
 * Delete product
 * @param {number} id - Product ID
 * @returns {Promise<Object>} Deleted product
 */
async function deleteProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return prisma.product.delete({
    where: { id: parseInt(id) },
  });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
