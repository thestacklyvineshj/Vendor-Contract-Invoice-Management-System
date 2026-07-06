const { body, validationResult } = require('express-validator');
const contractService = require('../services/contractService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const getAll = async (req, res, next) => {
  try {
    const result = await contractService.getAllContracts(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const create = [
  body('vendor_id').isInt().withMessage('Vendor ID is required'),
  body('contract_title').trim().notEmpty(),
  body('start_date').isDate(),
  body('end_date').isDate(),
  body('contract_value').isFloat({ min: 0 }),
  validate,
  async (req, res, next) => {
    try {
      const contract = await contractService.createContract(req.body);
      res.status(201).json({ success: true, data: contract });
    } catch (error) {
      next(error);
    }
  },
];

const update = async (req, res, next) => {
  try {
    const contract = await contractService.updateContract(req.params.id, req.body);
    res.json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await contractService.deleteContract(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
