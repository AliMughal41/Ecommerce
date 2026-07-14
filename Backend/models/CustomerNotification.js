const mongoose = require('mongoose');

const customerNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['product', 'order', 'general', 'promo'],
    default: 'general',
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  productImage: {
    type: String,
    default: '',
  },
  productPrice: {
    type: Number,
    default: 0,
  },
  recipients: [{
    type: String,
    required: true,
  }],
  readBy: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CustomerNotification', customerNotificationSchema);
