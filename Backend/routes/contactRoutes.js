const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const { sendContactEmail, getNotifications, markAsRead, deleteNotifications } = require('../controllers/contactController');

router.post('/', sendContactEmail);
router.get('/notifications', verifyAdmin, getNotifications);
router.put('/notifications/:id/read', verifyAdmin, markAsRead);
router.delete('/notifications', verifyAdmin, deleteNotifications);

module.exports = router;
