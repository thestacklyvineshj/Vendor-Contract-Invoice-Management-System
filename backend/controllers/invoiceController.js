const { body, validationResult } = require('express-validator');
const invoiceService = require('../services/invoiceService');
const approvalService = require('../services/approvalService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const getAll = async (req, res, next) => {
  try {
    const result = await invoiceService.getAllInvoices(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user);
    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

const create = [
  body('contract_id').isInt(),
  body('invoice_amount').isFloat({ min: 0.01 }),
  body('invoice_date').isDate(),
  body('due_date').isDate(),
  validate,
  async (req, res, next) => {
    try {
      const invoice = await invoiceService.createInvoice(req.body, req.user);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },
];

const update = async (req, res, next) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body, req.user);
    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const invoice = await approvalService.approveInvoice(req.params.id, req.user.id);
    res.json({ success: true, data: invoice, message: 'Invoice approved' });
  } catch (error) {
    next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const invoice = await approvalService.rejectInvoice(req.params.id, req.user.id, req.body.comment);
    res.json({ success: true, data: invoice, message: 'Invoice rejected' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove, approve, reject };
