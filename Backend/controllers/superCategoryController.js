const SuperCategory = require('../models/SuperCategory');

exports.getSuperCategories = async (req, res) => {
  try {
    const superCategories = await SuperCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, count: superCategories.length, superCategories });
  } catch (error) {
    console.error('Error fetching super categories:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch super categories.' });
  }
};

exports.getSuperCategory = async (req, res) => {
  try {
    const superCategory = await SuperCategory.findById(req.params.id);
    if (!superCategory) {
      return res.status(404).json({ success: false, message: 'Super category not found' });
    }
    res.json({ success: true, superCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch super category.' });
  }
};

exports.createSuperCategory = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Super category name is required.' });
    }

    const existing = await SuperCategory.findOne({
      name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Super category with this name already exists' });
    }

    const superCategory = await SuperCategory.create({
      name: name.trim(),
      description: (description || '').trim(),
      image: image || '',
      status: status || 'Active'
    });

    res.status(201).json({ success: true, message: 'Super category created successfully', superCategory });
  } catch (error) {
    console.error('Error creating super category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create super category.' });
  }
};

exports.updateSuperCategory = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;

    const superCategory = await SuperCategory.findById(req.params.id);
    if (!superCategory) {
      return res.status(404).json({ success: false, message: 'Super category not found' });
    }

    if (name && name !== superCategory.name) {
      const existing = await SuperCategory.findOne({
        name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Super category with this name already exists' });
      }
    }

    superCategory.name = name ? name.trim() : superCategory.name;
    superCategory.description = description !== undefined ? String(description).trim() : superCategory.description;
    superCategory.image = image !== undefined ? image : superCategory.image;
    superCategory.status = status || superCategory.status;
    superCategory.updatedAt = Date.now();

    await superCategory.save();
    res.json({ success: true, message: 'Super category updated successfully', superCategory });
  } catch (error) {
    console.error('Error updating super category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update super category.' });
  }
};

exports.deleteSuperCategory = async (req, res) => {
  try {
    const superCategory = await SuperCategory.findById(req.params.id);
    if (!superCategory) {
      return res.status(404).json({ success: false, message: 'Super category not found' });
    }

    const Category = require('../models/Category');
    const categoryCount = await Category.countDocuments({ superCategory: superCategory._id });
    if (categoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete super category. ${categoryCount} category(ies) are using it.`
      });
    }

    await superCategory.deleteOne();
    res.json({ success: true, message: 'Super category deleted successfully' });
  } catch (error) {
    console.error('Error deleting super category:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete super category.' });
  }
};
