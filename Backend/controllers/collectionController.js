const Collection = require('../models/Collection');
const cloudinary = require('cloudinary').v2;

// ─── Get All Collections ────────────────────────────────────────────────────
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: collections.length, collections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch collections.' });
  }
};

// ─── Get Single Collection ──────────────────────────────────────────────────
exports.getCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }
    res.status(200).json({ success: true, collection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch collection.' });
  }
};

// ─── Create Collection ──────────────────────────────────────────────────────
exports.createCollection = async (req, res) => {
  try {
    const { name, emoji, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Collection name is required.' });
    }

    const existing = await Collection.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A collection with this name already exists.' });
    }

    const collectionData = {
      name: name.trim(),
      emoji: emoji || '✨',
      description: description || '',
    };

    // Upload image to Cloudinary if provided (base64)
    if (image && typeof image === 'string' && /^data:image\//.test(image)) {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'velnora_collections',
        resource_type: 'image',
        format: 'jpg',
      });
      collectionData.image = result.secure_url;
      collectionData.imagePublicId = result.public_id;
    }

    const collection = await Collection.create(collectionData);
    res.status(201).json({ success: true, collection });
  } catch (error) {
    console.error('Create collection error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create collection.' });
  }
};

// ─── Update Collection ──────────────────────────────────────────────────────
exports.updateCollection = async (req, res) => {
  try {
    let collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const { name, emoji, description, image, status } = req.body;

    if (name && name.trim() !== collection.name) {
      const existing = await Collection.findOne({ name: name.trim(), _id: { $ne: collection._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'A collection with this name already exists.' });
      }
      collection.name = name.trim();
    }

    if (emoji !== undefined) collection.emoji = emoji;
    if (description !== undefined) collection.description = description;
    if (status) collection.status = status;

    // Replace image if new one provided
    if (image && typeof image === 'string' && /^data:image\//.test(image)) {
      // Delete old image from Cloudinary
      if (collection.imagePublicId) {
        try { await cloudinary.uploader.destroy(collection.imagePublicId); } catch (e) {}
      }
      const result = await cloudinary.uploader.upload(image, {
        folder: 'velnora_collections',
        resource_type: 'image',
        format: 'jpg',
      });
      collection.image = result.secure_url;
      collection.imagePublicId = result.public_id;
    }

    await collection.save();
    res.status(200).json({ success: true, collection });
  } catch (error) {
    console.error('Update collection error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update collection.' });
  }
};

// ─── Delete Collection ──────────────────────────────────────────────────────
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    // Delete image from Cloudinary
    if (collection.imagePublicId) {
      try { await cloudinary.uploader.destroy(collection.imagePublicId); } catch (e) {}
    }

    await collection.deleteOne();
    res.status(200).json({ success: true, message: 'Collection deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete collection.' });
  }
};
