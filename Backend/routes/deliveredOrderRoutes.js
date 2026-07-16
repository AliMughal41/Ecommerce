const express = require('express');
const router = express.Router();
const {
  getDeliveredOrders, getDeliveredStats, deleteDeliveredOrder, resetAllData, resetRevenue, getLastRevenueReset,
} = require('../controllers/deliveredOrderController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', verifyAdmin, getDeliveredOrders);
router.get('/stats', verifyAdmin, getDeliveredStats);
router.get('/last-reset', verifyAdmin, getLastRevenueReset);
router.post('/reset-all', verifyAdmin, resetAllData);
router.post('/reset-revenue', verifyAdmin, resetRevenue);
router.delete('/:id', verifyAdmin, deleteDeliveredOrder);

module.exports = router;
