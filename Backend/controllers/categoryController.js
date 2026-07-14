const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('superCategory', 'name slug').sort({ createdAt: -1 });
        res.json({ success: true, count: categories.length, categories });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch category.' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description, image, status, superCategory } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        // Use escaped string instead of RegExp to prevent ReDoS
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
        });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Category with this name already exists' });
        }

        const category = await Category.create({
            name: name.trim(),
            description: (description || '').trim(),
            image: image || '',
            status: status || 'Active',
            superCategory: superCategory || null
        });

        res.status(201).json({ success: true, message: 'Category created successfully', category });
    } catch (error) {
        console.error('Error creating category:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, description, image, status, superCategory } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                return res.status(400).json({ success: false, message: 'Category with this name already exists' });
            }
        }

        category.name = name ? name.trim() : category.name;
        category.description = description !== undefined ? String(description).trim() : category.description;
        category.image = image !== undefined ? image : category.image;
        category.status = status || category.status;
        if (superCategory !== undefined) category.superCategory = superCategory || null;
        category.updatedAt = Date.now();

        await category.save();
        res.json({ success: true, message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update category.' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const Product = require('../models/Product');
        const productCount = await Product.countDocuments({ category: category.name });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${productCount} product(s) are using this category.`
            });
        }

        await category.deleteOne();
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete category.' });
    }
};
