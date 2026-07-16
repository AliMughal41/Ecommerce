const DeliveredOrder = require('../models/DeliveredOrder');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const AnalyticsEvent = require('../models/Analytics');
const Return = require('../models/Return');
const RevenueReset = require('../models/RevenueReset');
const Category = require('../models/Category');
const SuperCategory = require('../models/SuperCategory');
const Subscriber = require('../models/Subscriber');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const CustomerNotification = require('../models/CustomerNotification');

const getResetFloor = async () => {
  const lastReset = await RevenueReset.findOne().sort({ resetAt: -1 }).lean();
  return lastReset?.resetAt || null;
};

// ─── Get all delivered orders ────────────────────────────────────────────────
exports.getDeliveredOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      const term = search.toLowerCase();
      query.$or = [
        { originalOrderNumber: { $regex: term, $options: 'i' } },
        { 'customer.fullName': { $regex: term, $options: 'i' } },
        { 'customer.email': { $regex: term, $options: 'i' } },
        { 'customer.phone': { $regex: term, $options: 'i' } },
        { 'customer.city': { $regex: term, $options: 'i' } },
      ];
    }
    const total = await DeliveredOrder.countDocuments(query);
    const orders = await DeliveredOrder.find(query)
      .sort({ deliveredAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    res.status(200).json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get delivered orders error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch delivered orders.' });
  }
};

// ─── Get delivered order stats ───────────────────────────────────────────────
exports.getDeliveredStats = async (req, res) => {
  try {
    const resetFloor = await getResetFloor();
    const baseMatch = resetFloor ? { deliveredAt: { $gte: resetFloor } } : {};

    const [revenueAgg, paymentStats, cityStats, monthlyStats] = await Promise.all([
      DeliveredOrder.aggregate([
        ...(resetFloor ? [{ $match: baseMatch }] : []),
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrder: { $avg: '$total' }, totalItems: { $sum: { $sum: '$items.quantity' } } } },
      ]),
      DeliveredOrder.aggregate([
        ...(resetFloor ? [{ $match: baseMatch }] : []),
        { $group: { _id: '$customer.paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { count: -1 } },
      ]),
      DeliveredOrder.aggregate([
        ...(resetFloor ? [{ $match: baseMatch }] : []),
        { $group: { _id: '$customer.city', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      DeliveredOrder.aggregate([
        ...(resetFloor ? [{ $match: baseMatch }] : []),
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$deliveredAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { _id: -1 } },
        { $limit: 12 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        summary: revenueAgg[0] || { totalRevenue: 0, totalOrders: 0, avgOrder: 0, totalItems: 0 },
        paymentStats,
        cityStats,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error('Delivered stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch delivered stats.' });
  }
};

// ─── Delete a single delivered order ─────────────────────────────────────────
exports.deleteDeliveredOrder = async (req, res) => {
  try {
    const order = await DeliveredOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Delivered order not found' });
    }
    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Delivered order deleted' });
  } catch (error) {
    console.error('Delete delivered order error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete delivered order.' });
  }
};

// ─── Reset ALL data: zero everything ────────────────────────────────────────
exports.resetAllData = async (req, res) => {
  try {
    await Promise.all([
      Order.deleteMany({}),
      DeliveredOrder.deleteMany({}),
      Product.updateMany({}, { $set: { stock: 99 } }),
      AnalyticsEvent.deleteMany({}),
      Return.deleteMany({}),
      Notification.deleteMany({}),
      CustomerNotification.deleteMany({}),
    ]);
    res.status(200).json({ success: true, message: 'All data reset successfully. Orders, delivered orders, analytics, returns, and notifications cleared. Product stock reset to 99.' });
  } catch (error) {
    console.error('Reset all data error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset data.' });
  }
};

// ─── Reset only revenue — sets a timestamp so analytics only count future data ──
exports.resetRevenue = async (req, res) => {
  try {
    await RevenueReset.deleteMany({});
    await RevenueReset.create({ resetAt: new Date(), triggeredBy: req.admin?.email || 'admin' });
    res.status(200).json({ success: true, message: 'Revenue reset. Analytics will now only count orders created after this point. All existing orders are preserved.' });
  } catch (error) {
    console.error('Reset revenue error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset revenue data.' });
  }
};

// ─── Get last revenue reset timestamp ───────────────────────────────────────
exports.getLastRevenueReset = async (req, res) => {
  try {
    const lastReset = await RevenueReset.findOne().sort({ resetAt: -1 }).lean();
    res.status(200).json({ success: true, resetAt: lastReset?.resetAt || null });
  } catch (error) {
    console.error('Get revenue reset error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue reset info.' });
  }
};

// ─── Get last revenue reset timestamp ───────────────────────────────────────
exports.getLastRevenueReset = async (req, res) => {
  try {
    const lastReset = await RevenueReset.findOne().sort({ resetAt: -1 }).lean();
    res.status(200).json({ success: true, resetAt: lastReset?.resetAt || null });
  } catch (error) {
    console.error('Get revenue reset error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue reset info.' });
  }
};
