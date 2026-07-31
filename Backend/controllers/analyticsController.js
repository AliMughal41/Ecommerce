const mongoose = require('mongoose');
const Order = require('../models/Order');
const DeliveredOrder = require('../models/DeliveredOrder');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const AnalyticsEvent = require('../models/Analytics');
const VisitorSession = require('../models/VisitorSession');
const Return = require('../models/Return');
const RevenueReset = require('../models/RevenueReset');

const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
const startOfWeek = (d = new Date()) => { const x = new Date(d); const day = x.getDay(); x.setDate(x.getDate() - day); x.setHours(0,0,0,0); return x; };
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const daysAgo = (n) => { const x = new Date(); x.setDate(x.getDate() - n); x.setHours(0,0,0,0); return x; };

const getResetFloor = async () => {
  const lastReset = await RevenueReset.findOne().sort({ resetAt: -1 }).lean();
  return lastReset?.resetAt || null;
};

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = startOfDay(now);
    const thisWeek = startOfWeek(now);
    const thisMonth = startOfMonth(now);
    const lastWeek = startOfWeek(daysAgo(7));
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const resetFloor = await getResetFloor();
    const baseMatch = resetFloor ? { createdAt: { $gte: resetFloor } } : {};
    const cancelledFilter = resetFloor
      ? { status: { $ne: 'Cancelled' }, createdAt: { $gte: resetFloor } }
      : { status: { $ne: 'Cancelled' } };
    const safeDate = (d) => resetFloor && resetFloor > d ? resetFloor : d;

    const [
      totalRevenueAgg, todayRevenueAgg, weekRevenueAgg, monthRevenueAgg,
      lastWeekRevenueAgg, lastMonthRevenueAgg,
      totalDeliveredOrders, deliveredToday, deliveredWeek, deliveredMonth,
      totalOrders, todayOrders, weekOrders, monthOrders,
      orderStatusCounts, totalProducts, activeProducts, outOfStock, lowStock,
      totalCustomers, todayCustomers, weekCustomers, monthCustomers,
      bestSellers, recentOrders, lowStockProducts, topCustomers,
      totalReturns, pendingReturns
    ] = await Promise.all([
      DeliveredOrder.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      DeliveredOrder.aggregate([{ $match: { deliveredAt: { $gte: safeDate(today) } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      DeliveredOrder.aggregate([{ $match: { deliveredAt: { $gte: safeDate(thisWeek) } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      DeliveredOrder.aggregate([{ $match: { deliveredAt: { $gte: safeDate(thisMonth) } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      DeliveredOrder.aggregate([{ $match: { deliveredAt: { $gte: safeDate(lastWeek), $lt: thisWeek } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      DeliveredOrder.aggregate([{ $match: { deliveredAt: { $gte: safeDate(lastMonth), $lt: lastMonthEnd } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      DeliveredOrder.countDocuments(),
      DeliveredOrder.countDocuments({ deliveredAt: { $gte: safeDate(today) } }),
      DeliveredOrder.countDocuments({ deliveredAt: { $gte: safeDate(thisWeek) } }),
      DeliveredOrder.countDocuments({ deliveredAt: { $gte: safeDate(thisMonth) } }),
      Order.countDocuments(baseMatch),
      Order.countDocuments({ createdAt: { $gte: safeDate(today) } }),
      Order.countDocuments({ createdAt: { $gte: safeDate(thisWeek) } }),
      Order.countDocuments({ createdAt: { $gte: safeDate(thisMonth) } }),
      Order.aggregate([{ $match: baseMatch }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0 } }),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 0, $lt: 5 } }),
      Customer.countDocuments({ isVerified: true }),
      Customer.countDocuments({ isVerified: true, createdAt: { $gte: safeDate(today) } }),
      Customer.countDocuments({ isVerified: true, createdAt: { $gte: safeDate(thisWeek) } }),
      Customer.countDocuments({ isVerified: true, createdAt: { $gte: safeDate(thisMonth) } }),
      Order.aggregate([
        { $match: { ...cancelledFilter } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
      Order.find(baseMatch).sort({ createdAt: -1 }).limit(10).lean(),
      Product.find({ stock: { $gt: 0, $lt: 5 } }).select('name stock mainImage category').lean(),
      Order.aggregate([
        { $match: { customerRef: { $ne: null }, ...cancelledFilter } },
        { $group: { _id: '$customerRef', totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
        { $unwind: '$customer' },
        { $project: { _id: 1, totalSpent: 1, orderCount: 1, name: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] }, email: '$customer.email' } },
      ]),
      Return.countDocuments(),
      Return.countDocuments({ status: 'Pending' }),
    ]);

    const totalRev = totalRevenueAgg[0]?.total || 0;
    const lastWeekRev = lastWeekRevenueAgg[0]?.total || 0;
    const thisWeekRev = weekRevenueAgg[0]?.total || 0;
    const lastMonthRev = lastMonthRevenueAgg[0]?.total || 0;
    const thisMonthRev = monthRevenueAgg[0]?.total || 0;
    const todayRev = todayRevenueAgg[0]?.total || 0;

    const avgOrderValue = totalDeliveredOrders > 0 ? totalRev / totalDeliveredOrders : 0;
    const weekGrowth = lastWeekRev > 0 ? ((thisWeekRev - lastWeekRev) / lastWeekRev * 100) : 0;
    const monthGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev * 100) : 0;

    const statusMap = {};
    orderStatusCounts.forEach(s => { statusMap[s._id] = s.count; });

    res.status(200).json({
      success: true,
      stats: {
        revenue: {
          total: totalRev,
          today: todayRev,
          thisWeek: thisWeekRev,
          thisMonth: thisMonthRev,
          avgOrderValue: Math.round(avgOrderValue),
          weekGrowth: Math.round(weekGrowth * 10) / 10,
          monthGrowth: Math.round(monthGrowth * 10) / 10,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          thisWeek: weekOrders,
          thisMonth: monthOrders,
          statusCounts: statusMap,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock,
          lowStock,
        },
        customers: {
          total: totalCustomers,
          today: todayCustomers,
          thisWeek: weekCustomers,
          thisMonth: monthCustomers,
        },
        bestSellers,
        recentOrders,
        lowStockProducts,
        topCustomers,
        returns: {
          total: totalReturns,
          pending: pendingReturns,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats.' });
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const resetFloor = await getResetFloor();
    let startDate, groupFormat;
    if (period === '7d') { startDate = daysAgo(7); groupFormat = '%Y-%m-%d'; }
    else if (period === '30d') { startDate = daysAgo(30); groupFormat = '%Y-%m-%d'; }
    else if (period === '12m') { startDate = daysAgo(365); groupFormat = '%Y-%m'; }
    else { startDate = daysAgo(30); groupFormat = '%Y-%m-%d'; }
    if (resetFloor && resetFloor > startDate) startDate = resetFloor;

    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, sales });
  } catch (error) {
    console.error('Sales chart error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load sales chart.' });
  }
};

exports.getCategorySales = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    let startDate = daysAgo(Number(days));
    const resetFloor = await getResetFloor();
    if (resetFloor && resetFloor > startDate) startDate = resetFloor;
    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
    ]);
    res.status(200).json({ success: true, sales });
  } catch (error) {
    console.error('Category sales error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load category sales.' });
  }
};

exports.getOrderValueDistribution = async (req, res) => {
  try {
    const resetFloor = await getResetFloor();
    const baseMatch = resetFloor ? { status: { $ne: 'Cancelled' }, createdAt: { $gte: resetFloor } } : { status: { $ne: 'Cancelled' } };
    const distribution = await Order.aggregate([
      { $match: baseMatch },
      {
        $bucket: {
          groupBy: '$total',
          boundaries: [0, 1000, 5000, 10000, 25000, 50000, Infinity],
          default: 'Other',
          output: { count: { $sum: 1 }, totalRevenue: { $sum: '$total' } },
        },
      },
    ]);
    res.status(200).json({ success: true, distribution });
  } catch (error) {
    console.error('Order value distribution error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load distribution.' });
  }
};

exports.getPaymentMethodStats = async (req, res) => {
  try {
    const resetFloor = await getResetFloor();
    const baseMatch = resetFloor ? { status: { $ne: 'Cancelled' }, createdAt: { $gte: resetFloor } } : { status: { $ne: 'Cancelled' } };
    const stats = await Order.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$customer.paymentMethod', count: { $sum: 1 }, totalRevenue: { $sum: '$total' } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Payment stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load payment stats.' });
  }
};

exports.getProductStats = async (req, res) => {
  try {
    const resetFloor = await getResetFloor();
    const staleDate = resetFloor && resetFloor > daysAgo(30) ? resetFloor : daysAgo(30);
    const [categoryCounts, staleProducts, mostViewed] = await Promise.all([
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: staleDate } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.name' }, lastSold: { $max: '$createdAt' } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { eventType: 'product_view' } },
        { $group: { _id: '$productId', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, views: 1, name: '$product.name', mainImage: '$product.mainImage' } },
      ]),
    ]);

    const staleProductIds = staleProducts.map(p => p._id?.toString());
    const unsoldProducts = await Product.find({
      _id: { $nin: staleProductIds },
      createdAt: { $lte: staleDate },
    }).select('name mainImage category stock createdAt').lean();

    res.status(200).json({ success: true, categoryCounts, unsoldProducts, mostViewed });
  } catch (error) {
    console.error('Product stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load product stats.' });
  }
};

exports.getCustomerStats = async (req, res) => {
  try {
    const resetFloor = await getResetFloor();
    const cancelledFilter = resetFloor
      ? { status: { $ne: 'Cancelled' }, createdAt: { $gte: resetFloor } }
      : { status: { $ne: 'Cancelled' } };

    const [newByDay, topSpenders, inactiveCustomers, locationStats] = await Promise.all([
      Customer.aggregate([
        { $match: { isVerified: true } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      Order.aggregate([
        { $match: { customerRef: { $ne: null }, ...cancelledFilter } },
        { $group: { _id: '$customerRef', totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, totalSpent: 1, orderCount: 1, name: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] }, email: '$customer.email', phone: '$customer.phone' } },
      ]),
      Customer.aggregate([
        { $match: { isVerified: true } },
        { $lookup: { from: 'orders', localField: '_id', foreignField: 'customerRef', as: 'orders' } },
        { $match: { 'orders.0': { $exists: false } } },
        { $project: { firstName: 1, lastName: 1, email: 1, createdAt: 1 } },
        { $limit: 20 },
      ]),
      Order.aggregate([
        { $match: cancelledFilter },
        { $group: { _id: '$customer.city', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.status(200).json({ success: true, newByDay, topSpenders, inactiveCustomers, locationStats });
  } catch (error) {
    console.error('Customer stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load customer stats.' });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate: reqStart, endDate: reqEnd } = req.query;
    const resetFloor = await getResetFloor();
    let start = reqStart ? new Date(reqStart) : daysAgo(30);
    let end = reqEnd ? new Date(reqEnd) : new Date();
    if (resetFloor && resetFloor > start) start = resetFloor;

    const cancelledFilter = { createdAt: { $gte: start, $lte: end }, status: { $ne: 'Cancelled' } };

    const [dailyRevenue, categoryRevenue, paymentRevenue, summary] = await Promise.all([
      Order.aggregate([
        { $match: cancelledFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: cancelledFilter },
        { $unwind: '$items' },
        { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } },
      ]),
      Order.aggregate([
        { $match: cancelledFilter },
        { $group: { _id: '$customer.paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: cancelledFilter },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrder: { $avg: '$total' }, maxOrder: { $max: '$total' }, minOrder: { $min: '$total' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      report: { dailyRevenue, categoryRevenue, paymentRevenue, summary: summary[0] || {}, startDate: start, endDate: end },
    });
  } catch (error) {
    console.error('Revenue report error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load revenue report.' });
  }
};

exports.getOrdersReport = async (req, res) => {
  try {
    const { status, startDate: reqStart, endDate: reqEnd, page = 1, limit = 20 } = req.query;
    const resetFloor = await getResetFloor();
    const query = {};
    if (status) query.status = status;
    if (reqStart || reqEnd) {
      query.createdAt = {};
      if (reqStart) query.createdAt.$gte = new Date(reqStart);
      if (reqEnd) query.createdAt.$lte = new Date(reqEnd);
    }
    if (resetFloor) {
      if (query.createdAt) {
        if (!query.createdAt.$gte || query.createdAt.$gte < resetFloor) query.createdAt.$gte = resetFloor;
      } else {
        query.createdAt = { $gte: resetFloor };
      }
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.status(200).json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Orders report error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load orders report.' });
  }
};

exports.getCustomReport = async (req, res) => {
  try {
    const { startDate: reqStart, endDate: reqEnd } = req.query;
    if (!reqStart || !reqEnd) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required.' });
    }
    const resetFloor = await getResetFloor();
    let start = new Date(reqStart);
    const end = new Date(reqEnd);
    end.setHours(23, 59, 59, 999);
    if (resetFloor && resetFloor > start) start = resetFloor;

    const baseMatch = { createdAt: { $gte: start, $lte: end } };
    const cancelledFilter = { ...baseMatch, status: { $ne: 'Cancelled' } };

    const [revenue, orders, customers, products, returns] = await Promise.all([
      Order.aggregate([
        { $match: cancelledFilter },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrder: { $avg: '$total' } } },
      ]),
      Order.aggregate([
        { $match: baseMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Customer.countDocuments({ isVerified: true, createdAt: { $gte: start, $lte: end } }),
      Order.aggregate([
        { $match: cancelledFilter },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { sold: -1 } },
        { $limit: 10 },
      ]),
      Return.aggregate([
        { $match: baseMatch },
        { $group: { _id: '$status', count: { $sum: 1 }, totalRefund: { $sum: '$totalRefund' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      report: {
        summary: revenue[0] || { totalRevenue: 0, totalOrders: 0, avgOrder: 0 },
        orderStatus: orders,
        newCustomers: customers,
        topProducts: products,
        returns,
        startDate: start,
        endDate,
      },
    });
  } catch (error) {
    console.error('Custom report error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate report.' });
  }
};

const getClientIp = (req) => {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '';
};

// ── Server-side geolocation (cached by IP, no CORS issues) ─────────────────
const geoCacheMap = new Map();

const isPrivateIp = (ip) => {
  if (!ip) return true;
  const p = ip.replace(/^::ffff:/, '').toLowerCase();
  if (p === '::1' || p.startsWith('fc') || p.startsWith('fd') || p.startsWith('fe8') || p.startsWith('fe9') || p.startsWith('fea') || p.startsWith('feb')) return true;
  const parts = p.split('.');
  if (parts.length !== 4) return false;
  return parts[0] === '10'
    || parts[0] === '127'
    || (parts[0] === '172' && Number(parts[1]) >= 16 && Number(parts[1]) <= 31)
    || (parts[0] === '192' && parts[1] === '168')
    || (parts[0] === '169' && parts[1] === '254')
    || (parts[0] === '100' && Number(parts[1]) >= 64 && Number(parts[1]) <= 127);
};

const lookupGeo = async (ip) => {
  if (!ip || isPrivateIp(ip)) return { city: '', country: '' };
  const cached = geoCacheMap.get(ip);
  if (cached) return cached;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://ipwho.is/${ip}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const geo = {
        city: data.success === false ? '' : (data.city || ''),
        country: data.success === false ? '' : (data.country_name || data.country || ''),
      };
      geoCacheMap.set(ip, geo);
      if (geoCacheMap.size > 5000) geoCacheMap.clear();
      return geo;
    }
  } catch { /* ignore */ }
  return { city: '', country: '' };
};

exports.trackEvent = async (req, res) => {
  const logErr = (where, err) => console.error(`Analytics track (${where}) error:`, err?.message || err);
  const debug = req.headers['x-analytics-debug'] === '1' ? {} : null;

  try {
    const {
      eventType, productId, path, query: searchQuery, sessionId,
      deviceType, browser, os, referrer, source, city, country, screen, metadata,
    } = req.body;
    const customerId = req.customer?._id || null;
    const ip = getClientIp(req);

    if (!eventType) return res.status(200).json({ success: true });

    let validProductId;
    if (productId) {
      try { validProductId = new mongoose.Types.ObjectId(String(productId)); } catch { validProductId = undefined; }
    }

    const lookedUp = await lookupGeo(ip);
    const geo = {
      city: city || lookedUp.city,
      country: country || lookedUp.country,
    };

    if (sessionId) {
      try {
        const now = new Date();
        const setOnInsert = {
          sessionId,
          startTime: now,
          deviceType: deviceType || '',
          browser: browser || '',
          os: os || '',
          referrer: referrer || '',
          source: source || '',
          ip,
          customerId,
        };
        const inc = eventType === 'page_view' ? { pageViews: 1 } : {};
        const push = eventType === 'page_view' && path ? { $push: { pages: { $each: [path], $slice: -10 } } } : {};
        const geoSet = {};
        if (geo.city) geoSet.city = geo.city;
        if (geo.country) geoSet.country = geo.country;
        await VisitorSession.updateOne(
          { sessionId },
          { $setOnInsert: setOnInsert, $set: { lastActive: now, ...geoSet }, ...inc, ...push },
          { upsert: true }
        );
        if (debug) debug.session = 'ok';
      } catch (err) {
        logErr('session', err);
        if (debug) debug.sessionError = err?.message;
      }
    }

    try {
      await AnalyticsEvent.create({
        eventType,
        productId: validProductId,
        customerId,
        sessionId: sessionId || '',
        path: path || '',
        query: searchQuery || '',
        userAgent: req.headers['user-agent'] || '',
        ip,
        deviceType: deviceType || '',
        browser: browser || '',
        os: os || '',
        referrer: referrer || '',
        source: source || '',
        city: geo.city,
        country: geo.country,
        screen: screen || '',
        metadata: metadata || {},
      });
      if (debug) debug.event = 'ok';
    } catch (err) {
      logErr('event', err);
      if (debug) debug.eventError = err?.message;
    }
    res.status(200).json({ success: true, ...(debug || {}) });
  } catch (error) {
    logErr('trackEvent', error);
    if (debug) debug.topError = error?.message;
    res.status(200).json({ success: true, ...(debug || {}) });
  }
};

exports.trackSessionHeartbeat = async (req, res) => {
  try {
    const {
      sessionId, deviceType, browser, os, referrer, source, city, country,
    } = req.body;
    const ip = getClientIp(req);

    if (!sessionId) return res.status(200).json({ success: true });

    const now = new Date();
    const existing = await VisitorSession.findOne({ sessionId }).lean();
    if (existing) {
      const update = { $set: { lastActive: now } };
      if (!existing.city || !existing.country) {
        const lookedUp = await lookupGeo(ip);
        if (lookedUp.city && !existing.city) update.$set.city = lookedUp.city;
        if (lookedUp.country && !existing.country) update.$set.country = lookedUp.country;
      }
      await VisitorSession.updateOne({ sessionId }, update);
    } else {
      const geo = await lookupGeo(ip);
      await VisitorSession.create({
        sessionId,
        startTime: now,
        lastActive: now,
        deviceType: deviceType || '',
        browser: browser || '',
        os: os || '',
        referrer: referrer || '',
        source: source || '',
        ip,
        city: geo.city || city || '',
        country: geo.country || country || '',
      });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(200).json({ success: true });
  }
};

exports.trackSessionEnd = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(200).json({ success: true });
    await VisitorSession.updateOne(
      { sessionId },
      { $set: { endTime: new Date() } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(200).json({ success: true });
  }
};

exports.getAnalyticsEvents = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = daysAgo(Number(days));
    const stats = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]);
    const dailyViews = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: startDate }, eventType: 'page_view' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, stats, dailyViews });
  } catch (error) {
    console.error('Analytics events error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load analytics.' });
  }
};
