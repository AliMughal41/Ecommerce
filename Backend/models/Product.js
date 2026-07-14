const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
  },
  category: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
  },
  salePrice: {
    type: Number,
    default: null,
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Active', 'Low Stock', 'Out of Stock'],
      message: 'Please select correct status for product',
    },
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  mainImage: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
