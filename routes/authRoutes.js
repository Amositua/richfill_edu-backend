const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { register, login, forgotPassword, googleLogin   } = require('../controllers/authController');
const admin = require("../config/firebaseAdmin");
const authMiddleware = require('../middlewares/authMiddleware');
const jwt = require("jsonwebtoken");


router.post('/register', register);
router.post('/login', login);

router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.verified) {
    return res.status(400).json({ message: 'Invalid request or already verified.' });
  }

  if (
    user.verificationCode !== code ||
    user.verificationCodeExpires < new Date()
  ) {
    return res.status(400).json({ message: 'Invalid or expired verification code.' });
  }

  user.verified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  res.status(200).json({ message: 'Email verified successfully.' });
});

router.post('/resend-code', async (req, res) => {
  const sendVerificationEmail = require('../utils/sendVerificationEmail');
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.verified) {
    return res.status(400).json({ message: 'User not found or already verified.' });
  }

  const newCode = Math.floor(10000 + Math.random() * 90000).toString();
  const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationCode = newCode;
  user.verificationCodeExpires = newExpiry;
  await user.save();

  await sendVerificationEmail(email, newCode);

  res.status(200).json({ message: 'Code resent.' });
});

router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired reset code.' });
  }

  user.password = newPassword; // your password hashing middleware should kick in
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;

  await user.save();

  res.status(200).json({ message: 'Password has been reset successfully.' });
});


router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:token', resetPassword);
// router.post('/google', googleLogin);



router.post("/google-signin", async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;
    console.log("Decoded token:", decodedToken);

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: uid, // Optional, or random string
        isVerified: true,
        photo: picture,
        authProvider: "google",
      });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Google sign-in failed:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});


module.exports = router;