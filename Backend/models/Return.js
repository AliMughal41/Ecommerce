const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, default: '' },
});

const returnSchema = new mongoose.Schema({
  returnNumber: {
    type: String,
    unique: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    default: '',
  },
  customerPhone: {
    type: String,
    default: '',
  },
  items: [returnItemSchema],
  reason: {
    type: String,
    required: [true, 'Please provide a reason for return'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Refunded', 'Completed'],
    default: 'Pending',
  },
  deliveryCharges: {
    type: Number,
    default: 0,
  },
  packingCharges: {
    type: Number,
    default: 0,
  },
  totalProductValue: {
    type: Number,
    required: true,
  },
  totalRefund: {
    type: Number,
    required: true,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

returnSchema.pre('save', async function () {
  if (this.returnNumber) return;
  const count = await mongoose.models.Return.countDocuments();
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  this.returnNumber = `RET-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [{ status: 'Pending', timestamp: new Date(), note: 'Return request created' }];
  }
});

module.exports = mongoose.model('Return', returnSchema);
