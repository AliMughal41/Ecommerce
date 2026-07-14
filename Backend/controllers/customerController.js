const Customer = require('../models/Customer');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
});

// ─── Send OTP Email ──────────────────────────────────────────────────────────
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Velnora" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background:#0a0a0a; padding: 40px; max-width: 500px; margin: auto; border-radius: 8px; border: 1px solid #3d3020;">
        <div style="text-align:center; margin-bottom: 28px;">
          <h1 style="color:#c9a84c; font-size: 28px; letter-spacing: 4px; margin: 0;">VELNORA</h1>
          <p style="color:#8a7a6a; font-size: 12px; letter-spacing: 2px; margin: 4px 0 0;">PASSWORD RESET</p>
        </div>
        <h2 style="color:#ffffff; font-size: 18px; margin-bottom: 8px;">Hello!</h2>
        <p style="color:#a09080; font-size: 14px; line-height: 1.7; margin-bottom: 28px;">
          You requested a password reset for your Velnora account. Use the OTP below to reset your password. This code expires in <strong style="color:#c9a84c;">15 minutes</strong>.
        </p>
        <div style="background:#1a1410; border: 1px solid #3d3020; border-radius: 6px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <p style="color:#8a7a6a; font-size: 12px; letter-spacing: 2px; margin: 0 0 12px;">YOUR RESET CODE</p>
          <div style="font-size: 42px; font-weight: 900; letter-spacing: 14px; color: #c9a84c; font-family: monospace;">${otp}</div>
        </div>
        <p style="color:#555; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─── Cookie Options ──────────────────────────────────────────────────────────
const getCookieOptions = () => {
  const days = parseInt(process.env.COOKIE_EXPIRE) || 7;
  return {
    httpOnly: true,
    maxAge: days * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
};

// ─── Send Token ──────────────────────────────────────────────────────────────
const sendToken = (customer, statusCode, res) => {
  const token = customer.getJwtToken();
  const cookieOptions = getCookieOptions();
  const customerData = {
    _id: customer._id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    avatar: customer.avatar,
    role: customer.role,
    isVerified: customer.isVerified,
    createdAt: customer.createdAt,
  };
  res.status(statusCode).cookie('customerToken', token, cookieOptions).json({
    success: true,
    token,
    customer: customerData,
  });
};

// ─── Register Customer ──────────────────────────────────────────────────────
const registerCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
    }

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'A customer with this email already exists.' });
    }

    const customer = await Customer.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    sendToken(customer, 201, res);
  } catch (error) {
    console.error('Customer registration error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── Login Customer ──────────────────────────────────────────────────────────
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email & password.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() }).select('+password');
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password.' });
    }

    const isPasswordMatched = await customer.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password.' });
    }

    sendToken(customer, 200, res);
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── Logout Customer ─────────────────────────────────────────────────────────
const logoutCustomer = async (req, res) => {
  try {
    res.cookie('customerToken', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

// ─── Get Customer Profile ───────────────────────────────────────────────────
const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    res.status(200).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};

// ─── Update Profile ──────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'First name, last name, and email are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
    }

    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (email.toLowerCase() !== customer.email) {
      const emailTaken = await Customer.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'A customer with this email already exists.' });
      }
    }

    customer.firstName = firstName.trim();
    customer.lastName = lastName.trim();
    customer.email = email.toLowerCase().trim();
    customer.phone = phone || customer.phone;

    await customer.save();

    res.status(200).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// ─── Change Password ─────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const customer = await Customer.findById(req.customer._id).select('+password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const isPasswordMatched = await customer.comparePassword(currentPassword);
    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }

    customer.password = newPassword;
    await customer.save();

    sendToken(customer, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

// ─── Forgot Password (Send OTP) ─────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!customer) {
      return res.status(200).json({ success: true, message: 'If an account exists with that email, an OTP has been sent.' });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    customer.otp = otp;
    customer.otpExpiry = otpExpiry;
    await customer.save();

    await sendOtpEmail(email.toLowerCase(), otp);

    res.status(200).json({ success: true, message: 'If an account exists with that email, an OTP has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ success: false, message: 'Password reset failed. Please try again.' });
  }
};

// ─── Verify Reset OTP ───────────────────────────────────────────────────────
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    // Timing-safe OTP comparison
    const otpBuffer = Buffer.from(customer.otp || '', 'utf8');
    const inputBuffer = Buffer.from(String(otp), 'utf8');
    if (otpBuffer.length !== inputBuffer.length || !crypto.timingSafeEqual(otpBuffer, inputBuffer)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    if (customer.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const resetToken = jwt.sign({ id: customer._id, purpose: 'password-reset' }, process.env.JWT_SECRET_KEY, {
      expiresIn: '10m',
    });

    res.status(200).json({ success: true, resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'OTP verification failed.' });
  }
};

// ─── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Reset token, new password, and confirm password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired.' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const customer = await Customer.findById(decoded.id).select('+otp +otpExpiry');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }

    customer.password = newPassword;
    customer.otp = undefined;
    customer.otpExpiry = undefined;
    await customer.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
};

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const isAuthenticatedCustomer = async (req, res, next) => {
  try {
    const { customerToken } = req.cookies;
    if (!customerToken) {
      return res.status(401).json({ success: false, message: 'Login first to access this resource.' });
    }
    const decoded = jwt.verify(customerToken, process.env.JWT_SECRET_KEY);
    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.customer = customer;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomerProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  isAuthenticatedCustomer,
};
