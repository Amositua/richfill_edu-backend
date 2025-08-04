const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const sendVerificationEmail = require('../utils/sendVerificationEmail');
const sendResetPasswordEmail = require('../utils/sendResendPasswordEmail');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const verificationCode = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit code
  const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationCode,
    verificationCodeExpires: codeExpires,
  });

  await sendVerificationEmail(email, verificationCode); // Send code instead of link

  res.status(201).json({ message: 'Verification code sent to email.' });
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.verified) {
    return res.status(401).json({ message: 'Email not verified' });
  }

  const isMatch = await user.comparePassword(password); // assuming you use bcrypt

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);

  // res.status(200).json({
  //   _id: user._id,
  //   name: user.name,
  //   email: user.email,
  //   role: user.role,
  //   token,
  // });
  res.status(200).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
};


// @desc Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  user.resetCode = code;
  user.resetCodeExpires = expires;
  await user.save();

  await sendResetPasswordEmail(email, code); // implement below

  res.status(200).json({ message: 'Reset code sent to email.' });
};

// @desc Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route   POST /api/auth/google
// @desc    Login or register with Google
exports.googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: googleId, // random or Google sub (won’t be used)
      });
      await user.save();
    }

    const token = generateToken(user);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
       token,
    });
  } catch (err) {
    res.status(401).json({ error: 'Google login failed' });
  }
};
