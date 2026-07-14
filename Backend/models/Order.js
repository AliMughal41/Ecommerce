const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  image: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
});

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
  whatsapp: {
    type: String,
    default: '',
  },
  address1: {
    type: String,
    required: true,
  },
  address2: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  postal: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  paymentMethod: {
    type: String,
    default: 'cod',
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  customerRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
  isGuest: {
    type: Boolean,
    default: true,
  },
  customer: {
    type: customerSchema,
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  trackingId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
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

orderSchema.pre('save', async function () {
  if (this.orderNumber) return;
  const count = await mongoose.models.Order.countDocuments();
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  this.orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  this.statusHistory = [{ status: 'Pending', timestamp: new Date(), note: 'Order placed' }];
});

module.exports = mongoose.model('Order', orderSchema);
