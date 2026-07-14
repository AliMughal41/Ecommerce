const express = require('express');
const router = express.Router();
const {
  getMyOrders, getMyOrder, trackOrder, cancelMyOrder, submitReturnRefund, getMyReturnRefunds,
} = require('../controllers/customerOrderController');
const { verifyCustomer } = require('../middleware/auth');

// Public
router.get('/track', trackOrder);

// Protected
router.get('/my-orders', verifyCustomer, getMyOrders);
router.get('/my-orders/:id', verifyCustomer, getMyOrder);
router.put('/my-orders/:id/cancel', verifyCustomer, cancelMyOrder);
router.post('/my-orders/:id/return-refund', verifyCustomer, submitReturnRefund);
router.get('/my-return-refunds', verifyCustomer, getMyReturnRefunds);

module.exports = router;
