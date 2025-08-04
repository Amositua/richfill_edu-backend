// File: routes/paymentRoutes.js

const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middlewares/authMiddleware');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize payment
router.post('/initialize', authMiddleware, async (req, res) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: "amosomohodion@gmail.com",
        amount: course.price * 100,
        callback_url: 'https://10.99.92.222:5000/api/payment/success', // Paystack uses kobo
        metadata: {
          userId: req.user.id,
          courseId: course._id 
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // console.log('FULL verify response:', response.data);

    res.status(200).json({ authorization_url: response.data.data.authorization_url, reference: response.data.data.reference });
  } catch (err) {
    console.error('Paystack init error:', err);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  const { reference } = req.body;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });
console.log('FULL verify response:', response.data);

    const data = response.data.data;
  
    if (data.status === 'success') {
      const existing = await Payment.findOne({ reference: data.reference });
      if (!existing) {
        await Payment.create({
          user: data.metadata.userId,
          course: data.metadata.courseId,
          amount: data.amount,
          status: 'success',
          reference: data.reference,
        });
      }
      return res.status(200).json({ message: 'Payment verified' });
    } else {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('Paystack verify error:', err);
    res.status(500).json({ message: 'Payment verification error' });
  }
});

// Check if course is paid by user
router.get('/is-paid/:courseId', authMiddleware, async (req, res) => {
  const { courseId } = req.params;
  try {
    const payment = await Payment.findOne({ course: courseId, user: req.user.id, status: 'success' });
    res.status(200).json({ isPaid: !!payment });
  } catch (err) {
    res.status(500).json({ message: 'Error checking payment status' });
  }
});

// Get all paid courses for a user
router.get('/my-courses', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id, status: 'success' });
    const courseIds = payments.map(p => p.course);
    const courses = await Course.find({ _id: { $in: courseIds } }).populate('lessons');
    res.status(200).json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch paid courses' });
  }
});

module.exports = router;
