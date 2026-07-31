const mongoose = require('mongoose');

const visitorSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null,
  },
  pageViews: {
    type: Number,
    default: 0,
  },
  pages: {
    type: [String],
    default: [],
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
  ip: {
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
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

visitorSessionSchema.index({ startTime: -1 });
visitorSessionSchema.index({ source: 1 });
visitorSessionSchema.index({ deviceType: 1 });
visitorSessionSchema.index({ lastActive: -1 });

module.exports = mongoose.model('VisitorSession', visitorSessionSchema);
