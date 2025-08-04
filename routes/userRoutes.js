const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const updateProfile  = require('../controllers/userController');
const router = express.Router();

router.patch('/update-profile', authMiddleware, updateProfile);

module.exports = router;
