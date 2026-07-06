const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middlewares/auth');
const { roleGuard } = require('../middlewares/roleGuard');

const router = express.Router();

router.use(authenticate);

router.get('/', roleGuard('ADMIN', 'FINANCE_MANAGER', 'VENDOR'), invoiceController.getAll);
router.get('/:id', roleGuard('ADMIN', 'FINANCE_MANAGER', 'VENDOR'), invoiceController.getById);
router.post('/', roleGuard('VENDOR'), invoiceController.create);
router.put('/:id', roleGuard('ADMIN', 'VENDOR'), invoiceController.update);
router.delete('/:id', roleGuard('ADMIN', 'VENDOR'), invoiceController.remove);
router.put('/:id/approve', roleGuard('FINANCE_MANAGER'), invoiceController.approve);
router.put('/:id/reject', roleGuard('FINANCE_MANAGER'), invoiceController.reject);

module.exports = router;
