const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    label: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
    },
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
      default: 'Pakistan',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

addressSchema.pre('save', async function () {
  if (this.isDefault) {
    await mongoose
      .model('Address')
      .updateMany(
        { customerId: this.customerId, _id: { $ne: this._id } },
        { isDefault: false }
      );
  }
});

module.exports = mongoose.model('Address', addressSchema);
