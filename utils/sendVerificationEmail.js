const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Richtech App" <no-reply@richtech.com>',
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h2>Your Richtech verification code</h2>
      <p>Enter this code in the app to verify your email:</p>
      <h1 style="letter-spacing: 6px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};

module.exports = sendVerificationEmail;
