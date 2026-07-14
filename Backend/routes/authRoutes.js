const express = require('express');
const router = express.Router();

const { loginAdmin, logout, registerAdmin, verifyOtp, verifyAdminToken, getAdminProfile, updateAdminProfile, changeAdminPassword, getAllAdmins, deleteAdmin } = require('../controllers/authController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logout);
router.get('/verify-token', verifyAdminToken);
router.get('/profile', verifyAdmin, getAdminProfile);
router.put('/profile', verifyAdmin, updateAdminProfile);
router.put('/change-password', verifyAdmin, changeAdminPassword);
router.get('/admins', verifyAdmin, getAllAdmins);
router.delete('/admins/:id', verifyAdmin, deleteAdmin);

module.exports = router;
