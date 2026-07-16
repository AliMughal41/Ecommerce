const mongoose = require('mongoose');

const revenueResetSchema = new mongoose.Schema({
  resetAt: { type: Date, required: true, default: Date.now },
  triggeredBy: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('RevenueReset', revenueResetSchema);
