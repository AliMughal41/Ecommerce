const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDatabase = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');

const app = express();

// ─── Trust Render proxy (fixes X-Forwarded-For rate limit error) ────────────
app.set('trust proxy', 1);

// ─── Security Headers ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  referrerPolicy: { policy: 'no-referrer-when-downgrade' },
}));

// ─── CORS (must be before rate limiters) ─────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limit to all routes
app.use(generalLimiter);

// ─── Body Parsers (reduced limits) ──────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ─── NoSQL Injection Protection (skip req.query — read-only in Node 24+) ────
const SANITIZE_REGEX = /^\$|\./;
function deepSanitize(obj) {
  if (Array.isArray(obj)) { obj.forEach(deepSanitize); }
  else if (obj && typeof obj === 'object' && obj.constructor === Object) {
    for (const key of Object.keys(obj)) {
      if (SANITIZE_REGEX.test(key)) {
        const val = obj[key]; delete obj[key];
        obj[key.replace(SANITIZE_REGEX, '_')] = val;
      } else { deepSanitize(obj[key]); }
    }
  }
}
app.use((req, res, next) => {
  deepSanitize(req.body);
  deepSanitize(req.params);
  next();
});

// ─── Remove fingerprinting headers ──────────────────────────────────────────
app.disable('x-powered-by');

// ─── Request Logger (sanitized) ────────────────────────────────────────────
app.use((req, res, next) => {
  const safeUrl = req.originalUrl.split('?')[0];
  console.log(`${new Date().toISOString()} -> ${req.method} ${safeUrl}`);
  next();
});

// ─── Connect to Database ───────────────────────────────────────────────────
connectDatabase();

// ─── Migrate: set first verified admin as founder ───────────────────────────
const Admin = require('./models/Admin');
setTimeout(async () => {
  try {
    const firstAdmin = await Admin.findOne({ isVerified: true }).sort({ createdAt: 1 });
    if (firstAdmin && firstAdmin.role !== 'founder') {
      firstAdmin.role = 'founder';
      await firstAdmin.save();
      console.log(`Migrated admin ${firstAdmin.email} to founder role`);
    }
  } catch (e) { /* ignore */ }
}, 3000);

// ─── Configure Cloudinary ──────────────────────────────────────────────────
configureCloudinary();

// ─── Import Routes ─────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const contactRoutes = require('./routes/contactRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const addressRoutes = require('./routes/addressRoutes');
const customerOrderRoutes = require('./routes/customerOrderRoutes');
const customerNotificationRoutes = require('./routes/customerNotificationRoutes');
const customerRoutes = require('./routes/customerRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const superCategoryRoutes = require('./routes/superCategoryRoutes');

// ─── Use Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscribers', strictLimiter, subscriberRoutes);
app.use('/api/contact', strictLimiter, contactRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customer', authLimiter, customerAuthRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/customer-orders', customerOrderRoutes);
app.use('/api/customer-notifications', customerNotificationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/super-categories', superCategoryRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Velnora API is running' });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered' });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed by CORS policy' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
