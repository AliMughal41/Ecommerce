const express = require('express');
const router = express.Router();
const {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
} = require('../controllers/collectionController');
const { verifyAdmin } = require('../middleware/auth');

// Public
router.get('/', getCollections);
router.get('/:id', getCollection);

// Admin only
router.post('/', verifyAdmin, createCollection);
router.put('/:id', verifyAdmin, updateCollection);
router.delete('/:id', verifyAdmin, deleteCollection);

module.exports = router;
