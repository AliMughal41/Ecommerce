const Admin = require('../models/Admin');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const MAX_ADMINS = 2;

// ─── Helper: Generate cryptographically secure OTP ──────────────────────────
const generateOtp = () => {
  return String(crypto.randomInt(100000, 999999));
};

// ─── Helper: Sanitize text for HTML output (XSS prevention) ────────────────
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

// ─── Email Transporter ───────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

// ─── Send OTP Email ──────────────────────────────────────────────────────────
const sendOtpEmail = async (email, otp, username) => {
  const safeName = escapeHtml(username);
  const mailOptions = {
    from: `"Velnora Admin" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Velnora Admin – Email Verification OTP',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background:#0a0a0a; padding: 40px; max-width: 500px; margin: auto; border-radius: 8px; border: 1px solid #3d3020;">
        <div style="text-align:center; margin-bottom: 28px;">
          <h1 style="color:#c9a84c; font-size: 28px; letter-spacing: 4px; margin: 0;">VELNORA</h1>
          <p style="color:#8a7a6a; font-size: 12px; letter-spacing: 2px; margin: 4px 0 0;">ADMIN PORTAL</p>
        </div>
        <h2 style="color:#ffffff; font-size: 18px; margin-bottom: 8px;">Hello, ${safeName}!</h2>
        <p style="color:#a09080; font-size: 14px; line-height: 1.7; margin-bottom: 28px;">
          You requested to create an admin account on Velnora. Use the OTP below to verify your email address. This code expires in <strong style="color:#c9a84c;">10 minutes</strong>.
        </p>
        <div style="background:#1a1410; border: 1px solid #3d3020; border-radius: 6px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <p style="color:#8a7a6a; font-size: 12px; letter-spacing: 2px; margin: 0 0 12px;">YOUR VERIFICATION CODE</p>
          <div style="font-size: 42px; font-weight: 900; letter-spacing: 14px; color: #c9a84c; font-family: monospace;">${otp}</div>
        </div>
        <p style="color:#555; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─── Send Token ───────────────────────────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();
  const options = {
    expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: { _id: user._id, username: user.username, email: user.email, isVerified: user.isVerified, role: user.role },
  });
};

// ─── Register Admin (Step 1: Send OTP) ───────────────────────────────────────
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
    }

    const adminCount = await Admin.countDocuments({ isVerified: true });
    if (adminCount >= MAX_ADMINS) {
      return res.status(403).json({ success: false, message: `Maximum ${MAX_ADMINS} admins allowed. Registration is closed.` });
    }

    const existingVerified = await Admin.findOne({ email: email.toLowerCase(), isVerified: true });
    if (existingVerified) {
      return res.status(400).json({ success: false, message: 'An admin with this email already exists.' });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let admin = await Admin.findOne({ email: email.toLowerCase(), isVerified: false });
    if (admin) {
      admin.username = username;
      admin.password = password;
      admin.otp = otp;
      admin.otpExpiry = otpExpiry;
      await admin.save();
    } else {
      admin = await Admin.create({ username, email: email.toLowerCase(), password, otp, otpExpiry, isVerified: false });
    }

    await sendOtpEmail(email.toLowerCase(), otp, username);
    res.status(200).json({ success: true, message: `OTP sent to ${email}. Please verify to complete registration.` });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── Verify OTP (Step 2: Complete Registration) ──────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), isVerified: false }).select('+otp +otpExpiry');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'No pending registration found for this email.' });
    }

    // Timing-safe OTP comparison
    const otpBuffer = Buffer.from(admin.otp || '', 'utf8');
    const inputBuffer = Buffer.from(String(otp), 'utf8');
    if (otpBuffer.length !== inputBuffer.length || !crypto.timingSafeEqual(otpBuffer, inputBuffer)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    if (admin.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please register again.' });
    }

    const verifiedCount = await Admin.countDocuments({ isVerified: true });
    if (verifiedCount >= MAX_ADMINS) {
      await admin.deleteOne();
      return res.status(403).json({ success: false, message: `Maximum ${MAX_ADMINS} admins allowed. Registration is closed.` });
    }

    admin.isVerified = true;
    if (verifiedCount === 0) admin.role = 'founder';
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    res.status(201).json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('OTP verification error:', error.message);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// ─── Login Admin ──────────────────────────────────────────────────────────────
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email & password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), isVerified: true }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
    }

    const isPasswordMatched = await admin.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
    }

    sendToken(admin, 200, res);
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── Logout Admin ─────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

// ─── Verify Admin Token (used by frontend to validate localStorage token) ───
exports.verifyAdminToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false });
    }
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const admin = await Admin.findById(decoded.id).select('username email isVerified role');
    if (!admin || !admin.isVerified) {
      return res.status(401).json({ success: false });
    }
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(401).json({ success: false });
  }
};

// ─── Auth Middleware ──────────────────────────────────────────────────────────
exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Login first to access this resource.' });
    }
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isVerified) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = admin;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ─── Get Admin Profile ───────────────────────────────────────────────────────
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('username email role createdAt');
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
};

// ─── Update Admin Profile (username + email) ─────────────────────────────────
exports.updateAdminProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'Username and email are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
    }
    if (email.toLowerCase() !== req.admin.email) {
      const existing = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: req.admin._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'This email is already in use by another admin.' });
      }
    }
    const admin = await Admin.findById(req.admin._id);
    admin.username = escapeHtml(username.trim());
    admin.email = email.toLowerCase();
    await admin.save();
    res.status(200).json({ success: true, message: 'Profile updated.', admin: { _id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// ─── Change Admin Password ───────────────────────────────────────────────────
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }
    const admin = await Admin.findById(req.admin._id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }
    admin.password = newPassword;
    await admin.save();
    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

// ─── Get All Admins (list) ───────────────────────────────────────────────────
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ isVerified: true }).select('username email role createdAt').sort({ createdAt: 1 });
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load admins.' });
  }
};

// ─── Delete Admin (founder only) ─────────────────────────────────────────────
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.admin.role !== 'founder') {
      return res.status(403).json({ success: false, message: 'Only the founder admin can delete other admins.' });
    }
    if (String(req.admin._id) === String(id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }
    const target = await Admin.findById(id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    await target.deleteOne();
    res.status(200).json({ success: true, message: 'Admin deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete admin.' });
  }
};
