const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
];

const login = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
];

const getProfile = async (req, res, next) => {
  try {
    const result = await authService.getProfile(req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
