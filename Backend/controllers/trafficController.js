const AnalyticsEvent = require('../models/Analytics');
const VisitorSession = require('../models/VisitorSession');
const Product = require('../models/Product');

const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const daysAgo = (n) => { const x = new Date(); x.setDate(x.getDate() - n); x.setHours(0, 0, 0, 0); return x; };

const parseDays = (val) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 && n <= 365 ? n : 30;
};

// ── 1. Website level ────────────────────────────────────────────────────────
exports.getTrafficStats = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const [sessions, pageViewCount] = await Promise.all([
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: start } } },
        {
          $group: {
            _id: null,
            uniqueVisitors: { $sum: 1 },
            totalPageViews: { $sum: '$pageViews' },
            bounced: { $sum: { $cond: [{ $lte: ['$pageViews', 1] }, 1, 0] } },
            durationMs: {
              $sum: {
                $subtract: [
                  { $ifNull: ['$endTime', '$lastActive'] },
                  '$startTime',
                ],
              },
            },
          },
        },
      ]),
      AnalyticsEvent.countDocuments({ eventType: 'page_view', createdAt: { $gte: start } }),
    ]);

    const s = sessions[0] || {};
    const uniqueVisitors = s.uniqueVisitors || 0;
    const totalPageViews = pageViewCount;
    const bounced = s.bounced || 0;
    const bounceRate = uniqueVisitors > 0 ? Math.round((bounced / uniqueVisitors) * 1000) / 10 : 0;
    const avgSessionSec = uniqueVisitors > 0 ? Math.round((s.durationMs || 0) / uniqueVisitors / 1000) : 0;

    const daily = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'page_view', createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, views: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const uniqueDaily = await VisitorSession.aggregate([
      { $match: { startTime: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }, visitors: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const mostVisitedPages = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'page_view', createdAt: { $gte: start }, path: { $ne: '' } } },
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 15 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPageViews,
        uniqueVisitors,
        bounceRate,
        avgSessionSec,
        bouncedSessions: bounced,
      },
      daily,
      uniqueDaily,
      mostVisitedPages,
    });
  } catch (error) {
    console.error('Traffic stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load traffic stats.' });
  }
};

// ── 2. Device / browser / OS breakdown ──────────────────────────────────────
exports.getDeviceStats = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const [devices, browsers, osStats] = await Promise.all([
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: start }, deviceType: { $ne: '' } } },
        { $group: { _id: '$deviceType', visitors: { $sum: 1 } } },
        { $sort: { visitors: -1 } },
      ]),
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: start }, browser: { $ne: '' } } },
        { $group: { _id: '$browser', visitors: { $sum: 1 } } },
        { $sort: { visitors: -1 } },
      ]),
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: start }, os: { $ne: '' } } },
        { $group: { _id: '$os', visitors: { $sum: 1 } } },
        { $sort: { visitors: -1 } },
      ]),
    ]);

    res.status(200).json({ success: true, devices, browsers, os: osStats });
  } catch (error) {
    console.error('Device stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load device stats.' });
  }
};

// ── 3. Traffic sources ──────────────────────────────────────────────────────
exports.getSourceStats = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const sources = await VisitorSession.aggregate([
      { $match: { startTime: { $gte: start }, source: { $ne: '' } } },
      { $group: { _id: '$source', visitors: { $sum: 1 }, pageViews: { $sum: '$pageViews' } } },
      { $sort: { visitors: -1 } },
    ]);

    const referrers = await VisitorSession.aggregate([
      { $match: { startTime: { $gte: start }, referrer: { $ne: '' } } },
      { $group: { _id: '$referrer', visitors: { $sum: 1 } } },
      { $sort: { visitors: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ success: true, sources, referrers });
  } catch (error) {
    console.error('Source stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load source stats.' });
  }
};

// ── 4. Location (city / country) ────────────────────────────────────────────
exports.getLocationStats = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const [countries, cities] = await Promise.all([
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: start }, country: { $ne: '' } } },
        { $group: { _id: '$country', visitors: { $sum: 1 } } },
        { $sort: { visitors: -1 } },
        { $limit: 15 },
      ]),
      VisitorSession.aggregate([
        { $match: { startTime: { $gte: start }, city: { $ne: '' } } },
        { $group: { _id: '$city', country: { $first: '$country' }, visitors: { $sum: 1 } } },
        { $sort: { visitors: -1 } },
        { $limit: 15 },
      ]),
    ]);

    res.status(200).json({ success: true, countries, cities });
  } catch (error) {
    console.error('Location stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load location stats.' });
  }
};

// ── 5. Time of visit (by hour) ──────────────────────────────────────────────
exports.getHourStats = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const byHour = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'page_view', createdAt: { $gte: start } } },
      { $group: { _id: { $hour: '$createdAt' }, views: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const hourLabels = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
    const byDay = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'page_view', createdAt: { $gte: start } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, views: { $sum: 1 } } },
    ]);
    const dayLabels = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const hours = hourLabels.map((label, i) => ({ label, hour: i, views: byHour.find(h => h._id === i)?.views || 0 }));
    const daysOfWeek = byDay.map(d => ({ day: dayLabels[d._id] || 'Unknown', views: d.views })).sort((a, b) => a.views > b.views ? -1 : 1);

    res.status(200).json({ success: true, hours, daysOfWeek });
  } catch (error) {
    console.error('Hour stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load hour stats.' });
  }
};

// ── 6. Overall conversion funnel ────────────────────────────────────────────
exports.getFunnelStats = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const events = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]);
    const map = {};
    events.forEach(e => { map[e._id] = e.count; });

    const pageViews = map.page_view || 0;
    const productViews = map.product_view || 0;
    const cartAdds = map.cart_add || 0;
    const checkoutStarts = map.checkout_start || 0;
    const purchases = map.purchase || 0;

    const toPct = (part, whole) => whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

    res.status(200).json({
      success: true,
      funnel: {
        pageViews,
        productViews,
        cartAdds,
        checkoutStarts,
        purchases,
        viewToCartRate: toPct(cartAdds, productViews),
        cartToPurchaseRate: toPct(purchases, cartAdds),
        overallConversion: toPct(purchases, productViews),
      },
    });
  } catch (error) {
    console.error('Funnel stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load funnel stats.' });
  }
};

// ── 7. Product-level funnel ─────────────────────────────────────────────────
exports.getProductFunnel = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const groupByProduct = async (eventType) => AnalyticsEvent.aggregate([
      { $match: { eventType, createdAt: { $gte: start }, productId: { $ne: null } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]);

    const [views, cartAdds, purchases, cartsPerSession] = await Promise.all([
      groupByProduct('product_view'),
      groupByProduct('cart_add'),
      groupByProduct('purchase'),
      AnalyticsEvent.aggregate([
        { $match: { eventType: 'cart_add', createdAt: { $gte: start }, productId: { $ne: null }, sessionId: { $ne: '' } } },
        { $group: { _id: { p: '$productId', s: '$sessionId' } } },
        { $group: { _id: '$_id.p', sessions: { $sum: 1 } } },
      ]),
    ]);

    const viewMap = {}; views.forEach(v => viewMap[v._id?.toString()] = v.count);
    const cartMap = {}; cartAdds.forEach(v => cartMap[v._id?.toString()] = v.count);
    const purchaseMap = {}; purchases.forEach(v => purchaseMap[v._id?.toString()] = v.count);
    const cartSessionMap = {}; cartsPerSession.forEach(v => cartSessionMap[v._id?.toString()] = v.sessions);

    const allIds = new Set([...Object.keys(viewMap), ...Object.keys(cartMap), ...Object.keys(purchaseMap)]);
    const productIds = [...allIds].filter(Boolean);

    const nameLookup = {};
    if (productIds.length) {
      const names = await AnalyticsEvent.aggregate([
        { $match: { productId: { $in: productIds }, 'metadata.productName': { $ne: '' } } },
        { $group: { _id: '$productId', name: { $first: '$metadata.productName' } } },
      ]);
      names.forEach(n => { nameLookup[n._id?.toString()] = n.name; });
    }

    const productMap = {};
    if (productIds.length) {
      const products = await Product.find({ _id: { $in: productIds } }).select('name mainImage').lean();
      products.forEach(p => { productMap[p._id.toString()] = p; });
    }

    const rows = productIds.map(id => {
      const viewsCount = viewMap[id] || 0;
      const cartsCount = cartMap[id] || 0;
      const purchaseCount = purchaseMap[id] || 0;
      return {
        productId: id,
        name: productMap[id]?.name || nameLookup[id] || `Product ${id.slice(0, 6)}`,
        image: productMap[id]?.mainImage || '',
        views: viewsCount,
        cartAdds: cartsCount,
        purchases: purchaseCount,
        abandonedSessions: cartSessionMap[id] || 0,
        viewToCartRate: viewsCount > 0 ? Math.round((cartsCount / viewsCount) * 1000) / 10 : 0,
        cartToPurchaseRate: cartsCount > 0 ? Math.round((purchaseCount / cartsCount) * 1000) / 10 : 0,
        conversionRate: viewsCount > 0 ? Math.round((purchaseCount / viewsCount) * 1000) / 10 : 0,
      };
    }).sort((a, b) => b.views - a.views).slice(0, 50);

    res.status(200).json({ success: true, products: rows });
  } catch (error) {
    console.error('Product funnel error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load product funnel.' });
  }
};

// ── 8. Abandoned carts ──────────────────────────────────────────────────────
exports.getAbandonedCarts = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const cartSessions = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'cart_add', createdAt: { $gte: start }, sessionId: { $ne: '' } } },
      { $group: { _id: '$sessionId', items: { $push: { productId: '$productId', name: '$metadata.productName', addedAt: '$createdAt' } }, lastAdd: { $max: '$createdAt' } } },
    ]);
    const purchaseSessions = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'purchase', createdAt: { $gte: start }, sessionId: { $ne: '' } } },
      { $group: { _id: '$sessionId' } },
    ]);
    const purchasedSet = new Set(purchaseSessions.map(s => s._id));

    const abandoned = cartSessions
      .filter(s => !purchasedSet.has(s._id))
      .map(s => ({
        sessionId: s._id,
        lastAdd: s.lastAdd,
        items: (s.items || []).slice(-5).filter(i => i.productId),
      }))
      .sort((a, b) => new Date(b.lastAdd) - new Date(a.lastAdd));

    const allProductIds = [...new Set(abandoned.flatMap(s => (s.items || []).map(i => i.productId)).filter(Boolean))];
    const productMap = {};
    if (allProductIds.length) {
      const products = await Product.find({ _id: { $in: allProductIds } }).select('name mainImage').lean();
      products.forEach(p => { productMap[p._id.toString()] = p; });
    }
    abandoned.forEach(s => {
      s.items = (s.items || []).map(i => ({
        productId: i.productId,
        name: productMap[i.productId]?.name || i.name || `Product ${String(i.productId).slice(0, 6)}`,
        image: productMap[i.productId]?.mainImage || '',
        addedAt: i.addedAt,
      }));
    });

    const abandonedSessions = abandoned.length;
    const totalSessions = cartSessions.length;
    const abandonedRate = totalSessions > 0 ? Math.round((abandonedSessions / totalSessions) * 1000) / 10 : 0;

    res.status(200).json({ success: true, abandoned, abandonedSessions, totalSessions, abandonedRate });
  } catch (error) {
    console.error('Abandoned carts error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load abandoned carts.' });
  }
};

// ── Raw event counts (overview) ─────────────────────────────────────────────
exports.getEventOverview = async (req, res) => {
  try {
    const { days } = req.query;
    const range = parseDays(days);
    const start = daysAgo(range);

    const events = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error('Event overview error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load event overview.' });
  }
};

// ── Reset all traffic analytics ─────────────────────────────────────────────
exports.resetTrafficAnalytics = async (req, res) => {
  try {
    const [eventsDeleted, sessionsDeleted] = await Promise.all([
      AnalyticsEvent.deleteMany({}),
      VisitorSession.deleteMany({}),
    ]);
    res.status(200).json({
      success: true,
      message: 'Traffic analytics reset successfully.',
      deleted: {
        events: eventsDeleted.deletedCount || 0,
        sessions: sessionsDeleted.deletedCount || 0,
      },
    });
  } catch (error) {
    console.error('Reset traffic analytics error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset traffic analytics.' });
  }
};
