const productService = require('../services/product.service');

/**
 * GET /api/products
 * Get all products
 */
async function getAllProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 * Get product by ID
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products
 * Create new product
 */
async function createProduct(req, res, next) {
  try {
    const { name, type, salesPrice, costPrice, isActive } = req.body;

    // Validate required fields
    if (!name || !type || !salesPrice || !costPrice) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, salesPrice, and costPrice are required',
      });
    }

    const product = await productService.createProduct({
      name,
      type,
      salesPrice,
      costPrice,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/products/:id
 * Update product
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, type, salesPrice, costPrice, isActive } = req.body;

    const product = await productService.updateProduct(id, {
      name,
      type,
      salesPrice,
      costPrice,
      isActive,
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id
 * Delete product
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

