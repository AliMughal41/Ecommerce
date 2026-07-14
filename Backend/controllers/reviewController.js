const Review = require('../models/Review');

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

// Public: get active reviews (for home page)
exports.getActiveReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// Admin: get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// Admin: create review
exports.createReview = async (req, res) => {
  try {
    const { author, text, rating, location, sortOrder } = req.body;
    if (!author || !text) {
      return res.status(400).json({ success: false, message: 'Author and text are required.' });
    }
    const review = await Review.create({
      author: String(author).trim(),
      text: String(text).trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      location: location ? String(location).trim() : '',
      sortOrder: Number(sortOrder) || 0,
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create review.' });
  }
};

// Admin: update review
exports.updateReview = async (req, res) => {
  try {
    const { author, text, rating, location, sortOrder, isActive } = req.body;
    const updateData = {};
    if (author !== undefined) updateData.author = String(author).trim();
    if (text !== undefined) updateData.text = String(text).trim();
    if (rating !== undefined) updateData.rating = Math.min(5, Math.max(1, Number(rating) || 5));
    if (location !== undefined) updateData.location = String(location).trim();
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder) || 0;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const review = await Review.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, review });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update review.' });
  }
};

// Admin: delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};

// Admin: toggle active status
exports.toggleReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    review.isActive = !review.isActive;
    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle review.' });
  }
};
