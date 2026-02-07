const discountService = require('../services/discount.service');

/**
 * GET /api/discounts
 */
async function getAllDiscounts(req, res, next) {
  try {
    const discounts = await discountService.getAllDiscounts();
    return res.status(200).json({ success: true, data: discounts });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/discounts/active
 */
async function getActiveDiscounts(req, res, next) {
  try {
    const discounts = await discountService.getActiveDiscounts();
    return res.status(200).json({ success: true, data: discounts });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/discounts/:id
 */
async function getDiscountById(req, res, next) {
  try {
    const discount = await discountService.getDiscountById(req.params.id);
    return res.status(200).json({ success: true, data: discount });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/discounts
 */
async function createDiscount(req, res, next) {
  try {
    const discount = await discountService.createDiscount(req.body);
    return res.status(201).json({ success: true, data: discount });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/discounts/:id
 */
async function updateDiscount(req, res, next) {
  try {
    const discount = await discountService.updateDiscount(req.params.id, req.body);
    return res.status(200).json({ success: true, data: discount });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/discounts/:id
 */
async function deleteDiscount(req, res, next) {
  try {
    await discountService.deleteDiscount(req.params.id);
    return res.status(200).json({ success: true, message: 'Discount deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/discounts/validate-coupon
 * Validate a coupon code
 */
async function validateCoupon(req, res, next) {
  try {
    const { couponCode, amount } = req.body;
    const result = await discountService.validateCoupon(couponCode, parseFloat(amount) || 0);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/discounts/available-coupons
 * Get list of available coupons for users
 */
async function getAvailableCoupons(req, res, next) {
  try {
    const coupons = await discountService.getAvailableCoupons();
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDiscounts,
  getActiveDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  validateCoupon,
  getAvailableCoupons,
};
