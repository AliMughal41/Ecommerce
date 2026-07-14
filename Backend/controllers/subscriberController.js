const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const websiteUrl = (process.env.FRONTEND_URL || 'https://shopvelnora.store').split(',')[0].trim();

const sendEmail = async ({ to, subject, html }) => {
  if (!to) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false },
  });
  await transporter.sendMail({
    from: `"Velnora" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
};

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(200).json({ success: true, message: 'You are already subscribed.' });
    }

    await Subscriber.create({ email: normalizedEmail });

    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; padding: 28px;">
        <div style="max-width: 700px; margin: auto; background: #121212; border: 1px solid #2a1f10; border-radius: 12px; overflow: hidden;">
          <div style="background: #141414; padding: 24px; text-align: center; border-bottom: 1px solid #2a1f10;">
            <h1 style="margin:0; color:#c9a84c; letter-spacing: 3px; font-size: 24px;">Welcome to Velnora</h1>
            <p style="margin:8px 0 0; color:#a09080;">Subscription confirmed</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color:#fff; margin-bottom: 12px;">Thank you for subscribing!</h2>
            <p style="color:#a09080; margin-bottom: 18px;">You will now receive the latest product drops and updates from our website.</p>
            <p style="color:#fff; margin-top: 8px;">We'll notify you whenever new products are added, including product images and brief details.</p>
            <p style="color:#a09080; margin-top: 24px; font-size:13px;">Visit our website anytime: <a href="${websiteUrl}" style="color:#c9a84c; text-decoration:none;">${websiteUrl}</a></p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: normalizedEmail,
      subject: 'Thanks for subscribing to Velnora',
      html,
    });

    return res.status(201).json({ success: true, message: 'Subscribed successfully.' });
  } catch (error) {
    console.error('Subscribe error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while subscribing.' });
  }
};

exports.sendProductNotification = async (product) => {
  try {
    const Customer = require('../models/Customer');
    const frozenCustomers = await Customer.find({ frozen: true }).select('email');
    const frozenEmails = new Set(frozenCustomers.map(c => c.email?.toLowerCase()));

    const subscribers = await Subscriber.find({});
    if (!subscribers || subscribers.length === 0) return;

    const safeName = escapeHtml(product.name);
    const safeDesc = escapeHtml(product.description?.slice(0, 180) || '');
    const contactNumber = '923444133108';
    const contactDisplay = '0344-4133108';

    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; padding: 28px;">
        <div style="max-width: 700px; margin: auto; background: #121212; border: 1px solid #2a1f10; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1a1508 0%, #141010 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #2a1f10;">
            <p style="color:#c9a84c; font-size:10px; letter-spacing:4px; margin:0 0 8px; text-transform:uppercase;">Velnora</p>
            <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:1px;">New Arrival Alert</h1>
            <p style="color:#a09080; font-size:12px; margin:10px 0 0;">Something exclusive just dropped at Velnora</p>
          </div>
          <div style="padding: 28px;">
            <h2 style="color:#fff; font-size:18px; margin:0 0 8px;">${safeName}</h2>
            <p style="color:#a09080; font-size:13px; margin:0 0 16px; line-height:1.7;">${safeDesc}</p>
            ${product.mainImage ? `<img src="${product.mainImage}" alt="" style="width:100%; max-width:520px; border-radius: 8px; margin-bottom: 20px; border:1px solid #2a1f10;" />` : ''}
            <div style="background:#0f0c09; border-radius:8px; padding:16px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between;">
              <div>
                <p style="color:#a09080; font-size:11px; letter-spacing:1px; margin:0 0 4px; text-transform:uppercase;">Price</p>
                <p style="color:#c9a84c; font-size:20px; font-weight:700; margin:0;">Rs. ${Number(product.price).toLocaleString()}</p>
              </div>
              <a href="${websiteUrl}/product/${product._id}" style="display:inline-block; background:#c9a84c; color:#0a0a0a; padding:12px 28px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:700; letter-spacing:1px;">BUY NOW</a>
            </div>
            <div style="background:rgba(201,168,76,0.04); border:1px solid rgba(201,168,76,0.12); border-radius:8px; padding:16px; text-align:center; margin-bottom:24px;">
              <p style="color:#c9a84c; font-size:11px; letter-spacing:2px; margin:0 0 8px; text-transform:uppercase; font-weight:700;">Stay Updated</p>
              <p style="color:#a09080; font-size:12px; margin:0 0 12px;">You're subscribed to Velnora alerts. We'll notify you of every new drop.</p>
              <a href="${websiteUrl}" style="display:inline-block; background:transparent; border:1px solid #c9a84c; color:#c9a84c; padding:10px 28px; border-radius:4px; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:1px;">EXPLORE VELNORA</a>
            </div>
            <div style="margin-top:32px; border-top:1px solid #2a1f10; padding-top:24px; text-align:center;">
              <p style="color:#c9a84c; font-size:15px; font-weight:700; letter-spacing:2px; margin:0 0 8px;">Thank You for Being a Valued Subscriber</p>
              <p style="color:#a09080; font-size:12px; margin:0 0 16px; line-height:1.6;">
                For any queries, feel free to reach out to us anytime.
              </p>
              <div style="margin-bottom:16px;">
                <a href="https://wa.me/${contactNumber}" style="display:inline-block; background:#c9a84c; color:#0a0a0a; padding:10px 28px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:700; letter-spacing:1px;">CONTACT ON WHATSAPP</a>
              </div>
              <p style="color:#a09080; font-size:11px; margin:0 0 6px;">or call us at <a href="tel:${contactDisplay}" style="color:#c9a84c; text-decoration:none;">${contactDisplay}</a></p>
              <p style="color:rgba(160,144,128,0.5); font-size:10px; margin:16px 0 0;">&copy; ${new Date().getFullYear()} Velnora. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const emails = subscribers
      .map(s => s.email)
      .filter(e => e && !frozenEmails.has(e.toLowerCase()));
    if (emails.length === 0) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false },
    });
    await transporter.sendMail({
      from: `"Velnora" <${process.env.SMTP_EMAIL}>`,
      bcc: emails.join(','),
      subject: `New Product on Velnora: ${product.name}`,
      html,
    });
  } catch (error) {
    console.error('Product notification error:', error.message);
  }
};
