const { body, validationResult } = require('express-validator');
const paymentService = require('../services/paymentService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const getAll = async (req, res, next) => {
  try {
    const result = await paymentService.getAllPayments(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const create = [
  body('invoice_id').isInt(),
  body('payment_amount').isFloat({ min: 0.01 }),
  body('payment_date').isDate(),
  body('payment_mode').trim().notEmpty(),
  body('transaction_reference').trim().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const payment = await paymentService.createPayment(req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  },
];

module.exports = { getAll, create };
