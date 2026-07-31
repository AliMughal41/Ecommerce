const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'page_view', 'product_view', 'cart_add', 'cart_remove', 'search',
      'register', 'login', 'checkout_start', 'purchase', 'wishlist_add',
      'product_click', 'session_end',
    ],
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
  sessionId: {
    type: String,
    default: '',
    index: true,
  },
  path: {
    type: String,
    default: '',
  },
  query: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  ip: {
    type: String,
    default: '',
  },
  deviceType: {
    type: String,
    default: '',
  },
  browser: {
    type: String,
    default: '',
  },
  os: {
    type: String,
    default: '',
  },
  referrer: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  screen: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ productId: 1, eventType: 1 });
analyticsEventSchema.index({ sessionId: 1, eventType: 1 });
analyticsEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
