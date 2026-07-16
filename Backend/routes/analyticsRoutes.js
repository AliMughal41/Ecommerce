const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getSalesChart, getCategorySales, getOrderValueDistribution,
  getPaymentMethodStats, getProductStats, getCustomerStats, getRevenueReport,
  getOrdersReport, getCustomReport, trackEvent, getAnalyticsEvents,
} = require('../controllers/analyticsController');
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
router.post('/track', trackEvent);

module.exports = router;
