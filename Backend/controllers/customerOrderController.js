const Order = require('../models/Order');
const ReturnRefund = require('../models/ReturnRefund');

// Get my orders (for logged-in customer)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { customerRef: req.customer._id },
        { 'customer.email': req.customer.email },
      ],
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// Get my single order
const getMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { customerRef: req.customer._id },
        { 'customer.email': req.customer.email },
      ],
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

// Track order by order number (public - no auth needed)
const trackOrder = async (req, res) => {
  try {
    const { orderNumber, email } = req.query;
    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Order number is required.' });
    }
    const query = { orderNumber };
    if (email) query['customer.email'] = email.toLowerCase().trim();
    const order = await Order.findOne(query).select('orderNumber status statusHistory trackingId customer items total createdAt');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to track order.' });
  }
};

// Cancel order (only if not shipped/delivered)
const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { customerRef: req.customer._id },
        { 'customer.email': req.customer.email },
      ],
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const nonCancellable = ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (nonCancellable.includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order with this status.' });
    }
    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', timestamp: new Date(), note: 'Cancelled by customer' });
    for (const item of order.items) {
      const Product = require('../models/Product');
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        if (product.stock > 0) product.status = 'Active';
        if (product.stock <= 10 && product.stock > 0) product.status = 'Low Stock';
        await product.save();
      }
    }
    await order.save();
    res.status(200).json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};

// Submit return/refund request
const submitReturnRefund = async (req, res) => {
  try {
    const { type, reason, description } = req.body;
    if (!type || !reason) {
      return res.status(400).json({ success: false, message: 'Type and reason are required.' });
    }
    if (!['return', 'refund'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid request type.' });
    }
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { customerRef: req.customer._id },
        { 'customer.email': req.customer.email },
      ],
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Return/refund can only be requested for delivered orders.' });
    }
    const existing = await ReturnRefund.findOne({ orderId: order._id, customerId: req.customer._id, status: { $nin: ['Rejected', 'Completed'] } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A return/refund request already exists for this order.' });
    }
    const request = await ReturnRefund.create({
      orderId: order._id,
      customerId: req.customer._id,
      type,
      reason: String(reason).trim(),
      description: description ? String(description).trim() : '',
    });
    res.status(201).json({ success: true, message: `Request submitted successfully.`, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit request.' });
  }
};

// Get my return/refund requests
const getMyReturnRefunds = async (req, res) => {
  try {
    const requests = await ReturnRefund.find({ customerId: req.customer._id }).populate('orderId', 'orderNumber total').sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
  }
};

module.exports = { getMyOrders, getMyOrder, trackOrder, cancelMyOrder, submitReturnRefund, getMyReturnRefunds };
