const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');

// Middleware: verify customer Bearer token
const verifyCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Please login to access this resource' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer not found' });
    }
    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Optional middleware: attach customer if token present, but don't block
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const customer = await Customer.findById(decoded.id);
      if (customer) {
        req.customer = customer;
      }
    }
  } catch (error) {
    // ignore - proceed as guest
  }
  next();
};

// Middleware: verify admin Bearer token
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isVerified) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin not found or not verified' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = { verifyCustomer, verifyAdmin, optionalAuth };
