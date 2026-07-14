const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Subscriber = require('../models/Subscriber');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const customers = await Customer.find({}).select('-password').sort({ createdAt: -1 });
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, customers, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

router.put('/:id/freeze', verifyAdmin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    customer.frozen = !customer.frozen;
    await customer.save();
    res.status(200).json({ success: true, message: customer.frozen ? 'Customer frozen' : 'Customer unfrozen', frozen: customer.frozen });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle freeze status' });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { type } = req.query;
    if (type === 'subscriber') {
      await Subscriber.findByIdAndDelete(req.params.id);
    } else {
      await Customer.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
});

module.exports = router;
