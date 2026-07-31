const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getSalesChart, getCategorySales, getOrderValueDistribution,
  getPaymentMethodStats, getProductStats, getCustomerStats, getRevenueReport,
  getOrdersReport, getCustomReport, trackEvent, trackSessionHeartbeat,
  trackSessionEnd, getAnalyticsEvents,
} = require('../controllers/analyticsController');
const {
  getTrafficStats, getDeviceStats, getSourceStats, getLocationStats,
  getHourStats, getFunnelStats, getProductFunnel, getAbandonedCarts,
  getEventOverview, resetTrafficAnalytics,
} = require('../controllers/trafficController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/dashboard', verifyAdmin, getDashboardStats);
router.get('/sales-chart', verifyAdmin, getSalesChart);
router.get('/category-sales', verifyAdmin, getCategorySales);
router.get('/order-value-distribution', verifyAdmin, getOrderValueDistribution);
router.get('/payment-methods', verifyAdmin, getPaymentMethodStats);
router.get('/product-stats', verifyAdmin, getProductStats);
router.get('/customer-stats', verifyAdmin, getCustomerStats);
router.get('/revenue-report', verifyAdmin, getRevenueReport);
router.get('/orders-report', verifyAdmin, getOrdersReport);
router.get('/custom-report', verifyAdmin, getCustomReport);
router.get('/events', verifyAdmin, getAnalyticsEvents);

// New traffic/behavior analytics
router.get('/traffic', verifyAdmin, getTrafficStats);
router.get('/devices', verifyAdmin, getDeviceStats);
router.get('/sources', verifyAdmin, getSourceStats);
router.get('/locations', verifyAdmin, getLocationStats);
router.get('/hours', verifyAdmin, getHourStats);
router.get('/funnel', verifyAdmin, getFunnelStats);
router.get('/product-funnel', verifyAdmin, getProductFunnel);
router.get('/abandoned-carts', verifyAdmin, getAbandonedCarts);
router.get('/event-overview', verifyAdmin, getEventOverview);
router.post('/reset-traffic', verifyAdmin, resetTrafficAnalytics);

// Public tracking endpoints
router.post('/track', trackEvent);
router.post('/session/heartbeat', trackSessionHeartbeat);
router.post('/session/end', trackSessionEnd);

module.exports = router;
