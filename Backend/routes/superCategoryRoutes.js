const express = require('express');
const router = express.Router();
const {
  getSuperCategories,
  getSuperCategory,
  createSuperCategory,
  updateSuperCategory,
  deleteSuperCategory
} = require('../controllers/superCategoryController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', getSuperCategories);
router.get('/:id', getSuperCategory);
router.post('/', verifyAdmin, createSuperCategory);
router.put('/:id', verifyAdmin, updateSuperCategory);
router.delete('/:id', verifyAdmin, deleteSuperCategory);

module.exports = router;
