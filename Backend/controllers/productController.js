const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const { sendProductNotification } = require('./subscriberController');
const { sendProductNotification: sendCustomerProductNotification } = require('./customerNotificationController');

// Validate base64 image format
const isValidBase64Image = (str) => {
  if (typeof str !== 'string') return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,/.test(str);
};

const ALLOWED_FIELDS = ['name', 'category', 'price', 'salePrice', 'stock', 'description', 'status'];

exports.newProduct = async (req, res) => {
  try {
    let images = [];
    if (typeof req.body.images === 'string') {
      images = [req.body.images];
    } else if (Array.isArray(req.body.images)) {
      images = req.body.images;
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    // Validate and upload images
    let imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      if (!isValidBase64Image(images[i])) {
        return res.status(400).json({ success: false, message: 'Invalid image format. Only JPG, PNG, and WebP are allowed.' });
      }
      const result = await cloudinary.uploader.upload(images[i], {
        folder: 'velnora_products',
        resource_type: 'image',
        format: 'jpg',
      });
      imagesLinks.push({ public_id: result.public_id, url: result.secure_url });
    }

    // Whitelist fields to prevent mass assignment
    const productData = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        productData[field] = req.body[field];
      }
    }
    productData.images = imagesLinks;
    productData.mainImage = imagesLinks[0].url;

    const product = await Product.create(productData);

    // Fire-and-forget notifications with logging
    console.log(`[NOTIFY] Product created: ${product.name} (ID: ${product._id})`);
    sendProductNotification(product)
      .then(() => console.log('[NOTIFY] Email notification sent to subscribers'))
      .catch(err => console.error('[NOTIFY] Email notification FAILED:', err.message));
    sendCustomerProductNotification(product)
      .then(() => console.log('[NOTIFY] In-app notification created for customers'))
      .catch(err => console.error('[NOTIFY] In-app notification FAILED:', err.message));

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingImages = req.body.existingImages || [];
    const existingPublicIds = existingImages.map(img => img.public_id);
    const removedImages = product.images.filter(img => !existingPublicIds.includes(img.public_id));

    for (const img of removedImages) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.error('Cloudinary delete error:', err.message);
      }
    }

    let imagesLinks = existingImages;

    const newImages = req.body.images || [];
    for (let i = 0; i < newImages.length; i++) {
      if (newImages[i] && isValidBase64Image(newImages[i])) {
        const result = await cloudinary.uploader.upload(newImages[i], {
          folder: 'velnora_products',
          resource_type: 'image',
          format: 'jpg',
        });
        imagesLinks.push({ public_id: result.public_id, url: result.secure_url });
      }
    }

    // Whitelist fields
    const updateData = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    updateData.images = imagesLinks;
    updateData.mainImage = imagesLinks.length > 0 ? imagesLinks[0].url : product.mainImage;

    product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    for (const img of product.images) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.error('Cloudinary delete error:', err.message);
      }
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};
