const express = require('express');
const router = express.Router();
const {
  getAddresses, getAddress, createAddress, updateAddress, deleteAddress, setDefaultAddress,
} = require('../controllers/addressController');
const { verifyCustomer } = require('../middleware/auth');

router.use(verifyCustomer);
router.get('/', getAddresses);
router.get('/:id', getAddress);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/set-default', setDefaultAddress);

module.exports = router;
