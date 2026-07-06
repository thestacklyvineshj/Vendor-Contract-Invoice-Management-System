const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');
const { roleGuard } = require('../middlewares/roleGuard');

const router = express.Router();

router.use(authenticate);

router.get('/', roleGuard('ADMIN', 'FINANCE_MANAGER', 'VENDOR'), paymentController.getAll);
router.post('/', roleGuard('FINANCE_MANAGER'), paymentController.create);

module.exports = router;
