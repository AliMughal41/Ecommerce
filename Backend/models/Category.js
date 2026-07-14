const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    superCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperCategory',
        default: null
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
    productCount: {
        type: Number,
        default: 0
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

// Update slug before saving
categorySchema.pre('save', async function() {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Category', categorySchema);