const planService = require('../services/plan.service');

/**
 * GET /api/plans
 * Get all recurring plans
 */
async function getAllPlans(req, res, next) {
  try {
    const plans = await planService.getAllPlans();

    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/plans/:id
 * Get plan by ID
 */
async function getPlanById(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/plans
 * Create new recurring plan
 */
async function createPlan(req, res, next) {
  try {
    const {
      name,
      price,
      billingPeriod,
      minQuantity,
      startDate,
      endDate,
      autoClose,
      closable,
      pausable,
      renewable,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || !price || !billingPeriod || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, billingPeriod, and startDate are required',
      });
    }

    // Validate billingPeriod enum
    const validPeriods = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
    if (!validPeriods.includes(billingPeriod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billingPeriod. Must be one of: DAILY, WEEKLY, MONTHLY, YEARLY',
      });
    }

    const plan = await planService.createPlan({
      name,
      price,
      billingPeriod,
      minQuantity,
      startDate,
      endDate,
      autoClose,
      closable,
      pausable,
      renewable,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/plans/:id
 * Update recurring plan
 */
async function updatePlan(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      billingPeriod,
      minQuantity,
      startDate,
      endDate,
      autoClose,
      closable,
      pausable,
      renewable,
      isActive,
    } = req.body;

    // Validate billingPeriod if provided
    if (billingPeriod) {
      const validPeriods = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
      if (!validPeriods.includes(billingPeriod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid billingPeriod. Must be one of: DAILY, WEEKLY, MONTHLY, YEARLY',
        });
      }
    }

    const plan = await planService.updatePlan(id, {
      name,
      price,
      billingPeriod,
      minQuantity,
      startDate,
      endDate,
      autoClose,
      closable,
      pausable,
      renewable,
      isActive,
    });

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/plans/:id
 * Delete recurring plan
 */
async function deletePlan(req, res, next) {
  try {
    const { id } = req.params;
    await planService.deletePlan(id);

    return res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};

