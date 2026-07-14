const mongoose = require('mongoose');

const superCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Super category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Super category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

superCategorySchema.pre('save', async function () {
  this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('SuperCategory', superCategorySchema);
