const express = require('express');
const router = express.Router();
const {
  createReturn, getAllReturns, getReturnStats, updateReturnStatus, deleteReturn, getReturnByOrder,
} = require('../controllers/returnController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/stats', verifyAdmin, getReturnStats);
router.get('/', verifyAdmin, getAllReturns);
router.post('/', verifyAdmin, createReturn);
router.put('/:id/status', verifyAdmin, updateReturnStatus);
router.delete('/:id', verifyAdmin, deleteReturn);
router.get('/order/:orderId', verifyAdmin, getReturnByOrder);

module.exports = router;
