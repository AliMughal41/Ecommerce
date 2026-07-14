const dns = require('dns');
const nodemailer = require('nodemailer');

let cachedTransporter = null;

const resolveIPv4 = (hostname) => {
  return new Promise((resolve, reject) => {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        resolve(hostname);
      } else {
        resolve(addresses[0]);
      }
    });
  });
};

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const ip = await resolveIPv4(host);

  cachedTransporter = nodemailer.createTransport({
    host: ip,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: false, servername: host },
    pool: true,
    maxConnections: 2,
  });

  return cachedTransporter;
};

module.exports = getTransporter;
