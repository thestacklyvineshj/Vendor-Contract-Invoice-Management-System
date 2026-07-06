const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');
const { roleGuard } = require('../middlewares/roleGuard');

const router = express.Router();

router.use(authenticate);

router.get('/admin', roleGuard('ADMIN'), dashboardController.getAdmin);
router.get('/finance', roleGuard('FINANCE_MANAGER'), dashboardController.getFinance);
router.get('/vendor', roleGuard('VENDOR'), dashboardController.getVendor);

module.exports = router;
