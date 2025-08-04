const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const {
      title, description, category, price, level,
      language, tags, isPaid, downloadable, duration
    } = req.body;

    const thumbnailUrl = req.file?.path || null; // multer adds file info to req.file

    const course = new Course({
      title,
      description,
      category,
      price,
      level,
      thumbnail: thumbnailUrl,
      language,
      tags,
      isPaid,
      downloadable,
      duration,
      teacher: req.user.id
    });

    await course.save();
    res.status(201).json({ message: 'Course created', course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating course' });
  }
};


// Add lesson to course
exports.addLesson = async (req, res) => {
  try {
    const { title, videoUrl, noteContent, duration, position, isPreview, attachments } = req.body;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (String(course.teacher) !== req.user.id) {
      return res.status(403).json({ message: 'You are not the course owner' });
    }

    const lesson = new Lesson({
      course: courseId,
      title,
      videoUrl,
      noteContent,
      attachments,
      duration,
      position,
      isPreview
    });

    await lesson.save();

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({ message: 'Lesson added', lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding lesson' });
  }
};

// Get all courses (public)
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
    .populate('lessons')
      .populate('teacher', 'name email')
      // .select('-lessons');

    res.status(200).json({courses: courses});
  } catch (err) {
    res.status(500).json({ message: 'Failed to get courses' });
  }
};

// Get single course with lessons
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lessons')
      .populate('teacher', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });
 
    res.status(200).json({course: course});
  } catch (err) {
    res.status(500).json({ message: 'Failed to get course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Optional: Check if current user is the course creator
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this course' });
    }

    await course.deleteOne();
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Server error while deleting course' });
  }
};
