const express = require('express');
const vendorController = require('../controllers/vendorController');
const { authenticate } = require('../middlewares/auth');
const { roleGuard } = require('../middlewares/roleGuard');

const router = express.Router();

router.use(authenticate);

router.get('/', roleGuard('ADMIN', 'FINANCE_MANAGER', 'VENDOR'), vendorController.getAll);
router.post('/', roleGuard('ADMIN'), vendorController.create);
router.put('/:id', roleGuard('ADMIN', 'VENDOR'), vendorController.update);
router.delete('/:id', roleGuard('ADMIN'), vendorController.remove);

module.exports = router;
