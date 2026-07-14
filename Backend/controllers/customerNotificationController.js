const CustomerNotification = require('../models/CustomerNotification');
const Customer = require('../models/Customer');
const Subscriber = require('../models/Subscriber');

const getMyNotifications = async (req, res) => {
  try {
    const email = req.customer.email;
    const notifications = await CustomerNotification.find({
      recipients: email,
    }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await CustomerNotification.countDocuments({
      recipients: email,
      readBy: { $ne: email },
    });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const email = req.customer.email;
    const notification = await CustomerNotification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: email } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const email = req.customer.email;
    await CustomerNotification.updateMany(
      { recipients: email, readBy: { $ne: email } },
      { $addToSet: { readBy: email } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

const sendProductNotification = async (product) => {
  try {
    const customers = await Customer.find({}).select('email frozen');
    console.log(`[NOTIFY] Total customers found: ${customers.length}`);
    const frozenEmails = new Set(
      customers.filter(c => c.frozen === true).map(c => c.email?.toLowerCase())
    );
    console.log(`[NOTIFY] Frozen customers: ${frozenEmails.size}`);

    const customerEmails = customers
      .filter(c => c.frozen !== true)
      .map(c => c.email);
    console.log(`[NOTIFY] Active customer emails: ${customerEmails.length}`);

    const subscribers = await Subscriber.find({}).select('email');
    console.log(`[NOTIFY] Total subscribers: ${subscribers.length}`);
    const subscriberEmails = subscribers
      .map(s => s.email)
      .filter(e => e && !frozenEmails.has(e.toLowerCase()));

    const allEmails = [...customerEmails, ...subscriberEmails];
    const uniqueEmails = [...new Set(allEmails.filter(Boolean))];
    console.log(`[NOTIFY] Unique emails for notification: ${uniqueEmails.length}`);
    if (uniqueEmails.length === 0) {
      console.log('[NOTIFY] No recipients found — skipping notification');
      return;
    }

    const notif = await CustomerNotification.create({
      title: `New Product: ${product.name}`,
      message: `Check out our new product "${product.name}" now available for Rs. ${product.price.toLocaleString()}!`,
      type: 'product',
      productId: product._id,
      productImage: product.images?.[0]?.url || '',
      productPrice: product.price,
      recipients: uniqueEmails,
    });
    console.log(`[NOTIFY] CustomerNotification created: ${notif._id} for ${uniqueEmails.length} recipients`);
  } catch (error) {
    console.error('[NOTIFY] Failed to send product notification:', error.message, error.stack);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, sendProductNotification };
