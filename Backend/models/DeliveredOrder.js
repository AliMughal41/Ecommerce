const mongoose = require('mongoose');

const deliveredOrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, default: '' },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  category: { type: String, default: '' },
}, { _id: false });

const deliveredCustomerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  address1: { type: String, required: true },
  address2: { type: String, default: '' },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postal: { type: String, default: '' },
  country: { type: String, required: true },
  notes: { type: String, default: '' },
  paymentMethod: { type: String, default: 'cod' },
}, { _id: false });

const deliveredOrderSchema = new mongoose.Schema({
  originalOrderNumber: { type: String, required: true },
  customerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  isGuest: { type: Boolean, default: true },
  customer: { type: deliveredCustomerSchema, required: true },
  items: [deliveredOrderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  trackingId: { type: String, default: '' },
  deliveredAt: { type: Date, default: Date.now },
  originalCreatedAt: { type: Date },
}, {
  timestamps: true,
});

deliveredOrderSchema.pre('save', async function () {
  if (this.deliveredAt) return;
  this.deliveredAt = new Date();
});

module.exports = mongoose.model('DeliveredOrder', deliveredOrderSchema);
