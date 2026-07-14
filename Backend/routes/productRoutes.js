const express = require('express');
const router = express.Router();

const { newProduct, getProducts, getSingleProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { isAuthenticatedUser } = require('../controllers/authController');

router.route('/').get(getProducts).post(isAuthenticatedUser, newProduct);
router.route('/:id').get(getSingleProduct).put(isAuthenticatedUser, updateProduct).delete(isAuthenticatedUser, deleteProduct);

module.exports = router;
