const { body, validationResult } = require('express-validator');
const vendorService = require('../services/vendorService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const getAll = async (req, res, next) => {
  try {
    const result = await vendorService.getAllVendors(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const create = [
  body('vendor_name').trim().notEmpty(),
  body('contact_person').trim().notEmpty(),
  body('phone').trim().notEmpty(),
  body('email').isEmail(),
  body('address').trim().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const vendor = await vendorService.createVendor(req.body);
      res.status(201).json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  },
];

const update = async (req, res, next) => {
  try {
    const vendor = await vendorService.updateVendor(req.params.id, req.body, req.user);
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await vendorService.deleteVendor(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
