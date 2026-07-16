const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['page_view', 'product_view', 'cart_add', 'cart_remove', 'search', 'register', 'login'],
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
analyticsEventSchema.index({ productId: 1, createdAt: -1 });
analyticsEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
