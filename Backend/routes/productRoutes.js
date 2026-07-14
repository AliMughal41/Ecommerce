const express = require('express');
const router = express.Router();

const { newProduct, getProducts, getSingleProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

router.route('/').get(getProducts).post(verifyAdmin, newProduct);
router.route('/:id').get(getSingleProduct).put(verifyAdmin, updateProduct).delete(verifyAdmin, deleteProduct);

module.exports = router;
