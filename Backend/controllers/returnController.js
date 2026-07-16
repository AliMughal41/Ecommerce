const Return = require('../models/Return');
const Order = require('../models/Order');

exports.createReturn = async (req, res) => {
  try {
    const { orderId, items, reason, deliveryCharges, packingCharges, adminNotes } = req.body;
    if (!orderId || !items || !items.length || !reason) {
      return res.status(400).json({ success: false, message: 'Order ID, items, and reason are required.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const totalProductValue = items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
    const totalRefund = totalProductValue + (Number(deliveryCharges) || 0) + (Number(packingCharges) || 0);

    const returnDoc = await Return.create({
      orderId,
      orderNumber: order.orderNumber,
      customerName: order.customer.fullName,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      items,
      reason,
      deliveryCharges: Number(deliveryCharges) || 0,
      packingCharges: Number(packingCharges) || 0,
      totalProductValue,
      totalRefund,
      adminNotes: adminNotes || '',
      statusHistory: [{ status: 'Pending', timestamp: new Date(), note: 'Return request created' }],
    });

    res.status(201).json({ success: true, return: returnDoc });
  } catch (error) {
    console.error('Create return error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create return.' });
  }
};

exports.getAllReturns = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Return.countDocuments(query);
    const returns = await Return.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.status(200).json({ success: true, returns, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get returns error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load returns.' });
  }
};

exports.getReturnStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, pending, approved, rejected, refunded, completed, todayReturns, weekReturns, monthReturns, statusDistribution] = await Promise.all([
      Return.countDocuments(),
      Return.countDocuments({ status: 'Pending' }),
      Return.countDocuments({ status: 'Approved' }),
      Return.countDocuments({ status: 'Rejected' }),
      Return.countDocuments({ status: 'Refunded' }),
      Return.countDocuments({ status: 'Completed' }),
      Return.countDocuments({ createdAt: { $gte: startOfDay } }),
      Return.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Return.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Return.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalRefund: { $sum: '$totalRefund' } } }]),
    ]);

    const totalRefundAmount = await Return.aggregate([
      { $match: { status: { $in: ['Approved', 'Refunded', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalRefund' } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total, pending, approved, rejected, refunded, completed,
        today: todayReturns, thisWeek: weekReturns, thisMonth: monthReturns,
        statusDistribution,
        totalRefundAmount: totalRefundAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Return stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load return stats.' });
  }
};

exports.updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const returnDoc = await Return.findById(id);
    if (!returnDoc) {
      return res.status(404).json({ success: false, message: 'Return not found.' });
    }

    returnDoc.status = status;
    returnDoc.statusHistory.push({ status, timestamp: new Date(), note: note || '' });
    if (note) returnDoc.adminNotes = note;
    await returnDoc.save();

    res.status(200).json({ success: true, return: returnDoc });
  } catch (error) {
    console.error('Update return status error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update return status.' });
  }
};

exports.deleteReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const returnDoc = await Return.findById(id);
    if (!returnDoc) {
      return res.status(404).json({ success: false, message: 'Return not found.' });
    }
    await returnDoc.deleteOne();
    res.status(200).json({ success: true, message: 'Return deleted.' });
  } catch (error) {
    console.error('Delete return error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete return.' });
  }
};

exports.getReturnByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const returns = await Return.find({ orderId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, returns });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load returns.' });
  }
};
