const cloudinary = require('../utils/cloudinary');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// Utility function to wrap Cloudinary's upload_stream in a Promise
const streamUpload = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
};

exports.addLesson = async (req, res) => {
  try {
    const { title, description } = req.body;
    const courseId = req.params.courseId;

    let videoUrl = '';
    let notesUrl = '';

    // Upload video if provided
    if (req.files['video']) {
      const videoResult = await streamUpload(req.files['video'][0].buffer, {
        resource_type: 'video',
        folder: 'courses/videos',
      });
      videoUrl = videoResult.secure_url;
    }

    // Upload notes if provided
    if (req.files['notes']) {
      const notesResult = await streamUpload(req.files['notes'][0].buffer, {
        resource_type: 'raw',
        folder: 'courses/notes',
      });
      notesUrl = notesResult.secure_url;
    }

    const lesson = new Lesson({
      title,
      description,
      videoUrl,
      notesUrl,
      course: courseId,
      courseTitle: "the courses titles", // Assuming courseTitle is passed in the body
    });

    await lesson.save();

    // Add lesson to course
    await Course.findByIdAndUpdate(courseId, {
      $push: { lessons: lesson._id },
    });

    res.status(201).json({ message: 'Lesson added', lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding lesson' });
  }
};

