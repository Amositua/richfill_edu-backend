const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { deleteCourse } = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');
const parser = require('../utils/cloudinary_multer'); // import multer config

// router.post('/', authMiddleware, courseController.createCourse);
router.post(
  '/create-course',
  authMiddleware,
  parser.single('thumbnail'), // parse file
  courseController.createCourse
); 
router.post('/:courseId/lessons', authMiddleware, courseController.addLesson);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.delete('/:id', authMiddleware, deleteCourse);



module.exports = router;