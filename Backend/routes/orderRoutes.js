const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');

const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');

router.get('/', verifyAdmin, getOrders);
router.post('/', optionalAuth, createOrder);
router.get('/:id', verifyAdmin, getOrder);
router.patch('/:id', verifyAdmin, updateOrderStatus);
router.delete('/:id', verifyAdmin, deleteOrder);

module.exports = router;
