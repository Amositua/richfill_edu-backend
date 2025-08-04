const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../utils/multer');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const { addLesson } = require('../controllers/lessonController');

router.post(
  '/:courseId',
  authMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'notes', maxCount: 1 },
  ]),
  addLesson
);

router.post('/lessons/:lessonId/complete', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.completedLessons.includes(req.params.lessonId)) {
      user.completedLessons.push(req.params.lessonId);
      await user.save();
    }

    res.json({ message: 'Lesson marked as completed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/lessons/:id
router.delete('/lessons/:id', authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    await lesson.deleteOne();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
