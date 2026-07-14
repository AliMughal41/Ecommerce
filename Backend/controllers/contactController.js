const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

exports.sendContactEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Please fill in all fields (name, email, subject, message).' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }

        // Validate lengths
        if (name.length > 100) return res.status(400).json({ success: false, message: 'Name is too long (max 100 characters).' });
        if (subject.length > 200) return res.status(400).json({ success: false, message: 'Subject is too long (max 200 characters).' });
        if (message.length > 5000) return res.status(400).json({ success: false, message: 'Message is too long (max 5000 characters).' });

        const notification = new Notification({
            type: 'contact_message',
            name: name.trim(),
            email: email.toLowerCase().trim(),
            subject: subject.trim(),
            message: message.trim()
        });
        await notification.save();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message);

        const mailOptions = {
            from: `"Velnora Contact Form" <${process.env.SMTP_EMAIL}>`,
            to: process.env.MY_EMAIL,
            replyTo: email,
            subject: `[Velnora Contact] ${safeSubject}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #3d3020; border-radius: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #1a1410, #0f0c09); padding: 30px; text-align: center; border-bottom: 2px solid #b89456;">
                        <h1 style="color: #b89456; margin: 0; font-size: 24px; letter-spacing: 3px;">VELNORA</h1>
                        <p style="color: #8a7a6a; margin: 8px 0 0; font-size: 13px; letter-spacing: 1px;">NEW CONTACT MESSAGE</p>
                    </div>
                    <div style="padding: 30px;">
                        <div style="background: #1a1410; border: 1px solid #2a1f10; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 10px 0; color: #b89456; font-weight: 600; font-size: 13px; letter-spacing: 1px; vertical-align: top; width: 100px;">NAME</td><td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${safeName}</td></tr>
                                <tr><td style="padding: 10px 0; color: #b89456; font-weight: 600; font-size: 13px; letter-spacing: 1px; vertical-align: top; border-top: 1px solid #2a1f10;">EMAIL</td><td style="padding: 10px 0; color: #ffffff; font-size: 14px; border-top: 1px solid #2a1f10;"><a href="mailto:${safeEmail}" style="color: #c9a84c; text-decoration: none;">${safeEmail}</a></td></tr>
                                <tr><td style="padding: 10px 0; color: #b89456; font-weight: 600; font-size: 13px; letter-spacing: 1px; vertical-align: top; border-top: 1px solid #2a1f10;">SUBJECT</td><td style="padding: 10px 0; color: #ffffff; font-size: 14px; border-top: 1px solid #2a1f10;">${safeSubject}</td></tr>
                            </table>
                        </div>
                        <div style="background: #1a1410; border: 1px solid #2a1f10; border-radius: 6px; padding: 20px;">
                            <p style="color: #b89456; font-weight: 600; font-size: 13px; letter-spacing: 1px; margin: 0 0 12px;">MESSAGE</p>
                            <p style="color: #d4c5b0; font-size: 14px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
                        </div>
                    </div>
                    <div style="background: #0f0c09; padding: 20px; text-align: center; border-top: 1px solid #2a1f10;">
                        <p style="color: #8a7a6a; font-size: 12px; margin: 0;">You can reply directly to this email to respond to ${safeName}.</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error('Contact email error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
};

exports.deleteNotifications = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide notification IDs to delete.' });
        }
        if (ids.length > 100) {
            return res.status(400).json({ success: false, message: 'Too many IDs. Max 100 per request.' });
        }
        await Notification.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ success: true, message: 'Notifications deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notifications.' });
    }
};
