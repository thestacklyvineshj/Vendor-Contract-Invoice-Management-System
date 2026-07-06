const express = require('express');
const contractController = require('../controllers/contractController');
const { authenticate } = require('../middlewares/auth');
const { roleGuard } = require('../middlewares/roleGuard');

const router = express.Router();

router.use(authenticate);

router.get('/', roleGuard('ADMIN', 'FINANCE_MANAGER', 'VENDOR'), contractController.getAll);
router.post('/', roleGuard('ADMIN'), contractController.create);
router.put('/:id', roleGuard('ADMIN'), contractController.update);
router.delete('/:id', roleGuard('ADMIN'), contractController.remove);

module.exports = router;
