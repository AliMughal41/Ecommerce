const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const { sendProductNotification } = require('./subscriberController');
const { sendProductNotification: sendCustomerProductNotification } = require('./customerNotificationController');

// Validate base64 image format
const isValidBase64Image = (str) => {
  if (typeof str !== 'string') return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,/.test(str);
};

// Compress base64 image using sharp — max 1200px width, quality 80, WebP
const compressImage = async (base64Str) => {
  const matches = base64Str.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
  if (!matches) return base64Str;
  const buffer = Buffer.from(matches[2], 'base64');
  const compressed = await sharp(buffer)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
  return `data:image/webp;base64,${compressed.toString('base64')}`;
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

    // Compress and upload images
    let imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      if (!isValidBase64Image(images[i])) {
        return res.status(400).json({ success: false, message: 'Invalid image format. Only JPG, PNG, and WebP are allowed.' });
      }
      const compressed = await compressImage(images[i]);
      const result = await cloudinary.uploader.upload(compressed, {
        folder: 'velnora_products',
        resource_type: 'image',
        format: 'webp',
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

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, products: [] });
    }
    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { price: isNaN(Number(q)) ? undefined : Number(q) },
      ],
    }).sort({ createdAt: -1 }).limit(20);
    const filtered = products.filter(p => {
      if (isNaN(Number(q))) return true;
      return true;
    });
    res.status(200).json({ success: true, products: filtered });
  } catch (error) {
    console.error('Search products error:', error.message);
    res.status(500).json({ success: false, message: 'Search failed.' });
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
        const compressed = await compressImage(newImages[i]);
        const result = await cloudinary.uploader.upload(compressed, {
          folder: 'velnora_products',
          resource_type: 'image',
          format: 'webp',
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
