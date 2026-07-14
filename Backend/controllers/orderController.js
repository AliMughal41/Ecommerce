const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const CustomerNotification = require('../models/CustomerNotification');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  tls: { rejectUnauthorized: false },
});

// ─── XSS Protection: Escape HTML entities ────────────────────────────────────
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const websiteUrl = (process.env.FRONTEND_URL || 'https://shopvelnora.store').split(',')[0].trim();
const contactNumber = '923444133108';
const contactDisplay = '0344-4133108';

const emailFooter = `
  <div style="margin-top:32px; border-top:1px solid #2a1f10; padding-top:24px; text-align:center;">
    <p style="color:#c9a84c; font-size:15px; font-weight:700; letter-spacing:2px; margin:0 0 8px;">Thank You for Choosing Velnora</p>
    <p style="color:#a09080; font-size:12px; margin:0 0 16px; line-height:1.6;">
      We hope you enjoy your purchase. For any queries or assistance, feel free to reach out to us.
    </p>
    <div style="margin-bottom:20px;">
      <a href="https://wa.me/${contactNumber}" style="display:inline-block; background:#c9a84c; color:#0a0a0a; padding:10px 28px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:700; letter-spacing:1px;">CONTACT ON WHATSAPP</a>
    </div>
    <p style="color:#a09080; font-size:11px; margin:0 0 6px;">or call us at <a href="tel:${contactDisplay}" style="color:#c9a84c; text-decoration:none;">${contactDisplay}</a></p>
    <div style="margin:20px 0;">
      <a href="${websiteUrl}" style="color:#c9a84c; text-decoration:none; font-size:13px; letter-spacing:1px;">${websiteUrl}</a>
    </div>
    <p style="color:rgba(160,144,128,0.5); font-size:10px; margin:0;">&copy; ${new Date().getFullYear()} Velnora. All Rights Reserved.</p>
  </div>
`;

const buildOrderItemsHtml = (items) => items.map(item => `
  <tr style="border-bottom:1px solid #2a1f10;">
    <td style="padding: 8px 10px; color:#fff; font-size:13px;">${escapeHtml(item.name)}</td>
    <td style="padding: 8px 10px; color:#a09080; font-size:13px; text-align:center;">${parseInt(item.quantity) || 0}</td>
    <td style="padding: 8px 10px; color:#a09080; font-size:13px; text-align:right;">${formatCurrency(item.price)}</td>
    <td style="padding: 8px 10px; color:#fff; font-size:13px; text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
  </tr>
`).join('');

const sendOrderNotification = async ({ to, subject, html }) => {
  if (!to) return;
  const mailOptions = {
    from: `"Velnora" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

const sendAdminOrderNotification = async (order) => {
  const adminEmail = process.env.MY_EMAIL || process.env.SMTP_EMAIL;
  if (!adminEmail) return;

  const orderRows = buildOrderItemsHtml(order.items);
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; padding: 28px;">
      <div style="max-width: 700px; margin: auto; background: #121212; border: 1px solid #2a1f10; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a1508 0%, #141010 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a1f10;">
          <p style="color:#c9a84c; font-size:10px; letter-spacing:4px; margin:0 0 8px; text-transform:uppercase;">Velnora</p>
          <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:1px;">New Order Received</h1>
          <div style="margin:14px auto 0; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.25); border-radius:6px; padding:8px 20px; display:inline-block;">
            <span style="color:#a09080; font-size:11px;">Order</span>
            <span style="color:#c9a84c; font-size:13px; font-weight:700; margin-left:6px;">${escapeHtml(order.orderNumber)}</span>
          </div>
        </div>
        <div style="padding: 28px;">
          <div style="background:rgba(201,168,76,0.04); border:1px solid rgba(201,168,76,0.1); border-radius:8px; padding:18px; margin-bottom:24px;">
            <p style="color:#c9a84c; font-size:10px; letter-spacing:2px; margin:0 0 12px; text-transform:uppercase; font-weight:700;">Customer Details</p>
            <p style="color:#a09080; margin:0 0 6px; font-size:13px;"><strong style="color:#fff;">Name:</strong> ${escapeHtml(order.customer.fullName)}</p>
            <p style="color:#a09080; margin:0 0 6px; font-size:13px;"><strong style="color:#fff;">Email:</strong> ${escapeHtml(order.customer.email) || 'N/A'}</p>
            <p style="color:#a09080; margin:0 0 6px; font-size:13px;"><strong style="color:#fff;">Phone:</strong> ${escapeHtml(order.customer.phone)}</p>
            <p style="color:#a09080; margin:0 0 6px; font-size:13px;"><strong style="color:#fff;">Address:</strong> ${escapeHtml(order.customer.address1)}${order.customer.address2 ? ', ' + escapeHtml(order.customer.address2) : ''}, ${escapeHtml(order.customer.city)}, ${escapeHtml(order.customer.province)}, ${escapeHtml(order.customer.country)}</p>
            <p style="color:#a09080; margin:0; font-size:13px;"><strong style="color:#fff;">Payment:</strong> ${order.customer.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp'}</p>
          </div>
          <p style="color:#c9a84c; font-size:10px; letter-spacing:2px; margin:0 0 12px; text-transform:uppercase; font-weight:700;">Order Summary</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 18px;">
            <thead><tr style="border-bottom:1px solid #2a1f10;">
              <th style="text-align:left; padding: 10px; color:#a09080; font-size:11px; letter-spacing:1px;">PRODUCT</th>
              <th style="text-align:center; padding: 10px; color:#a09080; font-size:11px; letter-spacing:1px;">QTY</th>
              <th style="text-align:right; padding: 10px; color:#a09080; font-size:11px; letter-spacing:1px;">PRICE</th>
              <th style="text-align:right; padding: 10px; color:#a09080; font-size:11px; letter-spacing:1px;">TOTAL</th>
            </tr></thead>
            <tbody>${orderRows}</tbody>
          </table>
          <div style="background:#0f0c09; border-radius:8px; padding:16px; margin-top:12px;">
            <div style="display:flex; justify-content:space-between; color:#a09080; font-size:13px; margin-bottom: 8px;"><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div>
            <div style="display:flex; justify-content:space-between; color:#a09080; font-size:13px; margin-bottom: 10px;"><span>Shipping</span><span>${formatCurrency(order.shippingFee)}</span></div>
            <div style="border-top:1px solid #2a1f10; padding-top:10px; display:flex; justify-content:space-between; color:#c9a84c; font-size:16px; font-weight:700;"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
          </div>
          ${emailFooter}
        </div>
      </div>
    </div>
  `;

  await sendOrderNotification({ to: adminEmail, subject: `Velnora New Order: ${order.orderNumber}`, html });
};

const sendCustomerOrderNotification = async (order) => {
  const customerEmail = order.customer.email;
  if (!customerEmail) return;

  const orderRows = buildOrderItemsHtml(order.items);
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; padding: 28px;">
      <div style="max-width: 700px; margin: auto; background: #121212; border: 1px solid #2a1f10; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a1508 0%, #141010 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a1f10;">
          <p style="color:#c9a84c; font-size:10px; letter-spacing:4px; margin:0 0 8px; text-transform:uppercase;">Velnora</p>
          <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:1px;">Order Confirmed!</h1>
          <div style="margin:14px auto 0; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.25); border-radius:6px; padding:8px 20px; display:inline-block;">
            <span style="color:#a09080; font-size:11px;">Order</span>
            <span style="color:#c9a84c; font-size:13px; font-weight:700; margin-left:6px;">${escapeHtml(order.orderNumber)}</span>
          </div>
        </div>
        <div style="padding: 28px;">
          <p style="color:#fff; font-size:15px; margin:0 0 8px;">Hi ${escapeHtml(order.customer.fullName)},</p>
          <p style="color:#a09080; font-size:13px; margin:0 0 24px; line-height:1.7;">
            Thank you for your order! We've received it and our team will contact you shortly to confirm the details. We appreciate your trust in Velnora.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 18px;">
            <thead><tr style="border-bottom:1px solid #2a1f10;">
              <th style="text-align:left; padding: 10px; color:#a09080; font-size:11px; letter-spacing:1px;">PRODUCT</th>
              <th style="text-align:center; padding: 10px; color:#a09080; font-size:11px; letter-spacing:1px;">QTY</th>
              <th style="text-align:right; padding: 10px; color:#a09080; font-size:11px; letter-spacing:1px;">PRICE</th>
              <th style="text-align:right; padding: 10px; color:#a09080; font-size:11px; letter-spacing:1px;">TOTAL</th>
            </tr></thead>
            <tbody>${orderRows}</tbody>
          </table>
          <div style="background:#0f0c09; border-radius:8px; padding:16px; margin-top:12px;">
            <div style="display:flex; justify-content:space-between; color:#a09080; font-size:13px; margin-bottom: 8px;"><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div>
            <div style="display:flex; justify-content:space-between; color:#a09080; font-size:13px; margin-bottom: 10px;"><span>Shipping</span><span>${formatCurrency(order.shippingFee)}</span></div>
            <div style="border-top:1px solid #2a1f10; padding-top:10px; display:flex; justify-content:space-between; color:#c9a84c; font-size:16px; font-weight:700;"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
          </div>
          <div style="background:rgba(201,168,76,0.04); border:1px solid rgba(201,168,76,0.12); border-radius:8px; padding:16px; margin-top:24px; text-align:center;">
            <p style="color:#c9a84c; font-size:11px; letter-spacing:2px; margin:0 0 8px; text-transform:uppercase; font-weight:700;">Stay Updated</p>
            <p style="color:#a09080; font-size:12px; margin:0 0 12px;">Subscribe to our website for new arrivals, exclusive deals, and latest updates.</p>
            <a href="${websiteUrl}" style="display:inline-block; background:transparent; border:1px solid #c9a84c; color:#c9a84c; padding:10px 28px; border-radius:4px; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:1px;">VISIT VELNORA</a>
          </div>
          ${emailFooter}
        </div>
      </div>
    </div>
  `;

  await sendOrderNotification({ to: customerEmail, subject: `Velnora Order Received - ${order.orderNumber}`, html });
};

const sendCustomerStatusUpdateNotification = async (order, newStatus, trackingId = '') => {
  const customerEmail = order.customer.email;
  if (!customerEmail) return;

  const statusLabel = newStatus === 'Processing' ? 'Confirmed' : newStatus;
  const statusMessage = newStatus === 'Processing'
    ? 'Your order has been confirmed and our team is preparing it for dispatch. We will notify you once it is on its way!'
    : newStatus === 'Shipped'
      ? 'Great news! Your order has been shipped and is on its way to you. You can expect delivery within 2-3 working days.'
      : newStatus === 'Delivered'
        ? `Your order has been delivered successfully! We hope you love your purchase. Thank you for shopping with Velnora!`
        : `Your order status has been updated to ${newStatus}. Our team is working to get your order to you as soon as possible.`;

  const trackingHtml = newStatus === 'Delivered'
    ? `<div style="background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:8px; padding:14px; margin-bottom:20px; text-align:center;">
        <p style="color:#2ecc71; font-size:11px; letter-spacing:2px; margin:0 0 6px; text-transform:uppercase; font-weight:700;">Tracking ID</p>
        <p style="color:#fff; font-size:16px; font-weight:700; margin:0; letter-spacing:2px;">${escapeHtml(trackingId)}</p>
       </div>`
    : newStatus === 'Shipped' && trackingId
      ? `<div style="background:rgba(201,168,76,0.04); border:1px solid rgba(201,168,76,0.15); border-radius:8px; padding:14px; margin-bottom:20px; text-align:center;">
          <p style="color:#c9a84c; font-size:11px; letter-spacing:2px; margin:0 0 6px; text-transform:uppercase; font-weight:700;">Tracking ID</p>
          <p style="color:#fff; font-size:16px; font-weight:700; margin:0; letter-spacing:2px;">${escapeHtml(trackingId)}</p>
         </div>`
      : '';

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; padding: 28px;">
      <div style="max-width: 700px; margin: auto; background: #121212; border: 1px solid #2a1f10; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a1508 0%, #141010 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a1f10;">
          <p style="color:#c9a84c; font-size:10px; letter-spacing:4px; margin:0 0 8px; text-transform:uppercase;">Velnora</p>
          <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:1px;">Order ${escapeHtml(statusLabel)}</h1>
          <div style="margin:14px auto 0; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.25); border-radius:6px; padding:8px 20px; display:inline-block;">
            <span style="color:#a09080; font-size:11px;">Order</span>
            <span style="color:#c9a84c; font-size:13px; font-weight:700; margin-left:6px;">${escapeHtml(order.orderNumber)}</span>
          </div>
        </div>
        <div style="padding: 28px;">
          <p style="color:#fff; font-size:15px; margin:0 0 8px;">Hi ${escapeHtml(order.customer.fullName)},</p>
          <p style="color:#a09080; font-size:13px; margin:0 0 20px; line-height:1.7;">${statusMessage}</p>
          ${trackingHtml}
          <div style="background:rgba(201,168,76,0.04); border:1px solid rgba(201,168,76,0.12); border-radius:8px; padding:16px; margin-top:12px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <p style="color:#c9a84c; font-size:10px; letter-spacing:2px; margin:0 0 4px; text-transform:uppercase; font-weight:700;">Current Status</p>
              <p style="color:#fff; font-size:14px; font-weight:600; margin:0;">${escapeHtml(newStatus)}</p>
            </div>
            <div style="width:40px; height:40px; background:rgba(201,168,76,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center;">
              <span style="font-size:18px;">${newStatus === 'Processing' ? '&#10003;' : newStatus === 'Shipped' ? '&#9992;' : newStatus === 'Delivered' ? '&#127873;' : '&#128230;'}</span>
            </div>
          </div>
          <div style="background:rgba(201,168,76,0.04); border:1px solid rgba(201,168,76,0.12); border-radius:8px; padding:16px; margin-top:24px; text-align:center;">
            <p style="color:#c9a84c; font-size:11px; letter-spacing:2px; margin:0 0 8px; text-transform:uppercase; font-weight:700;">Stay Updated</p>
            <p style="color:#a09080; font-size:12px; margin:0 0 12px;">Explore our latest collections and exclusive offers.</p>
            <a href="${websiteUrl}" style="display:inline-block; background:transparent; border:1px solid #c9a84c; color:#c9a84c; padding:10px 28px; border-radius:4px; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:1px;">VISIT VELNORA</a>
          </div>
          ${emailFooter}
        </div>
      </div>
    </div>
  `;

  await sendOrderNotification({ to: customerEmail, subject: `Velnora Order ${order.orderNumber} ${statusLabel}`, html });
};

// ─── Create Order (Server-side price calculation) ───────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, isGuest, customerRef } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order data is incomplete' });
    }

    if (!customer.fullName || !customer.phone || !customer.address1 || !customer.city || !customer.province || !customer.country) {
      return res.status(400).json({ success: false, message: 'Customer details are incomplete' });
    }

    // Validate and calculate prices server-side
    let computedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.name || item.productId}` });
      }
      const quantity = parseInt(item.quantity) || 1;
      if (quantity < 1 || quantity > 100) {
        return res.status(400).json({ success: false, message: 'Invalid quantity' });
      }
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${quantity}`
        });
      }
      const unitPrice = product.salePrice || product.price;
      computedSubtotal += unitPrice * quantity;
      validatedItems.push({
        productId: product._id,
        name: product.name,
        price: unitPrice,
        quantity,
        image: product.mainImage || (product.images && product.images[0]) || '',
      });
    }

    const shippingFee = 0;
    const total = computedSubtotal + shippingFee;

    const order = await Order.create({
      customer,
      items: validatedItems,
      subtotal: computedSubtotal,
      shippingFee,
      total,
      isGuest: isGuest !== undefined ? isGuest : true,
      customerRef: customerRef || null,
    });

    // Decrease stock
    for (const item of validatedItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        if (product.stock === 0) product.status = 'Out of Stock';
        else if (product.stock <= 10) product.status = 'Low Stock';
        await product.save();
      }
    }

    // Send emails in background (non-blocking)
    Promise.all([
      sendAdminOrderNotification(order),
      sendCustomerOrderNotification(order),
    ]).catch(emailError => console.error('Order email notification error:', emailError.message));

    // Create in-app notifications (always works, no SMTP needed)
    // 1. Admin in-app notification (new order alert)
    try {
      await Notification.create({
        type: 'new_order',
        name: order.customer.fullName,
        email: order.customer.email || 'guest',
        subject: `New Order: ${order.orderNumber}`,
        message: `New order received from ${order.customer.fullName}. Total: Rs. ${order.total.toLocaleString()}. Items: ${order.items.length}. Payment: ${order.customer.paymentMethod === 'cod' ? 'COD' : 'WhatsApp'}.`,
      });
    } catch (notifErr) {
      console.error('Admin notification error:', notifErr.message);
    }

    // 2. Customer in-app notification (if logged in)
    if (order.customerRef && order.customer.email) {
      try {
        const customerEmail = order.customer.email.toLowerCase();
        await CustomerNotification.create({
          title: `Order Placed: ${order.orderNumber}`,
          message: `Your order has been placed successfully! Total: Rs. ${order.total.toLocaleString()}. We will contact you shortly to confirm.`,
          type: 'order',
          recipients: [customerEmail],
        });
      } catch (notifErr) {
        console.error('Customer notification error:', notifErr.message);
      }
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { status, trackingId } = req.body;
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    if (status === 'Delivered' && (!trackingId || !trackingId.trim())) {
      return res.status(400).json({ success: false, message: 'Tracking ID is required to mark order as Delivered.' });
    }

    const oldStatus = order.status;
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: `Status updated from ${oldStatus} to ${status}`,
    });
    if (status === 'Delivered') {
      order.trackingId = trackingId.trim();
    }
    await order.save();

    if (oldStatus !== 'Cancelled' && status === 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          if (product.stock > 10) product.status = 'Active';
          else if (product.stock > 0) product.status = 'Low Stock';
          await product.save();
        }
      }
    }

    if (oldStatus !== status) {
      // Send email in background (non-blocking)
      const statusLabels = { Processing: 'Confirmed', Shipped: 'Shipped', Delivered: 'Delivered', Cancelled: 'Cancelled' };
      const statusMessages = {
        Processing: `Your order ${order.orderNumber} has been confirmed! Our team is preparing it for dispatch.`,
        Shipped: `Great news! Your order ${order.orderNumber} has been shipped and is on its way.`,
        Delivered: `Your order ${order.orderNumber} has been delivered successfully! Thank you for shopping with Velnora.`,
        Cancelled: `Your order ${order.orderNumber} has been cancelled. If you have any questions, please contact us.`,
      };

      try {
        if (status === 'Processing' || status === 'Delivered') {
          await sendCustomerStatusUpdateNotification(order, status, status === 'Delivered' ? order.trackingId : '');
        }
        // Also send for Shipped and Cancelled
        if (status === 'Shipped' || status === 'Cancelled') {
          await sendCustomerStatusUpdateNotification(order, status);
        }
      } catch (emailError) {
        console.error('Order status email error:', emailError.message);
      }

      // 3. Customer in-app notification for status update
      if (order.customer.email) {
        try {
          const customerEmail = order.customer.email.toLowerCase();
          const title = `Order ${statusLabels[status] || status}: ${order.orderNumber}`;
          const message = statusMessages[status] || `Your order ${order.orderNumber} status has been updated to ${status}.`;
          await CustomerNotification.create({
            title,
            message,
            type: 'order',
            recipients: [customerEmail],
          });
        } catch (notifErr) {
          console.error('Customer status notification error:', notifErr.message);
        }
      }

      // 4. Admin in-app notification for status change
      try {
        await Notification.create({
          type: 'order_update',
          name: order.customer.fullName,
          email: order.customer.email || 'guest',
          subject: `Order ${statusLabels[status] || status}: ${order.orderNumber}`,
          message: `Order ${order.orderNumber} status updated from ${oldStatus} to ${status}. Customer: ${order.customer.fullName}.`,
        });
      } catch (notifErr) {
        console.error('Admin status notification error:', notifErr.message);
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          if (product.stock > 10) product.status = 'Active';
          else if (product.stock > 0) product.status = 'Low Stock';
          await product.save();
        }
      }
    }

    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
};
