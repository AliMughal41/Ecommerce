const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  verifyRegistrationOtp,
  loginCustomer,
  googleAuth,
  logoutCustomer,
  getCustomerProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require('../controllers/customerController');
const { verifyCustomer } = require('../middleware/auth');

// Public routes
router.post('/register', registerCustomer);
router.post('/verify-registration', verifyRegistrationOtp);
router.post('/login', loginCustomer);
router.post('/google-auth', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/logout', logoutCustomer);
router.get('/me', verifyCustomer, getCustomerProfile);
router.put('/update-profile', verifyCustomer, updateProfile);
router.put('/change-password', verifyCustomer, changePassword);

module.exports = router;
