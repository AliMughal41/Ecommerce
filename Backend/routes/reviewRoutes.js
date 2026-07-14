const express = require('express');
const router = express.Router();
const { getActiveReviews, getAllReviews, createReview, updateReview, deleteReview, toggleReview } = require('../controllers/reviewController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', getActiveReviews);
router.get('/all', verifyAdmin, getAllReviews);
router.post('/', verifyAdmin, createReview);
router.put('/:id', verifyAdmin, updateReview);
router.delete('/:id', verifyAdmin, deleteReview);
router.put('/:id/toggle', verifyAdmin, toggleReview);

module.exports = router;
