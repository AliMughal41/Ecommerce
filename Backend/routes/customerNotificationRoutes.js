const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/customerNotificationController');
const { verifyCustomer } = require('../middleware/auth');

router.get('/', verifyCustomer, getMyNotifications);
router.put('/read-all', verifyCustomer, markAllAsRead);
router.put('/:id/read', verifyCustomer, markAsRead);

module.exports = router;
