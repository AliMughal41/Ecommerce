const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const sendEmail = async ({ to, subject, html, from, replyTo }) => {
  if (!to) throw new Error('No recipient provided');

  const params = {
    from: from || `Velnora <${FROM_EMAIL}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };

  if (replyTo) params.reply_to = replyTo;

  return resend.emails.send(params);
};

module.exports = { sendEmail, FROM_EMAIL };
