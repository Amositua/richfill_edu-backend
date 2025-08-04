const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middlewares/authMiddleware'); // Your JWT token validator

router.patch('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // If email is different and valid
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });
      user.email = email;
    }

    // If password is provided
 if (password && password.trim() !== '') {
  user.password = password; // Plain password — will be hashed by pre('save')
}


    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error while updating profile' });
  }
});

module.exports = router;
