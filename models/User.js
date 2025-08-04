const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },

  resetCode: String,
  resetCodeExpires: Date,

  verified: {
    type: Boolean,
    default: false,
  },
  verificationCode: String,
  verificationCodeExpires: Date,

  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  paidCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  createdAt: { type: Date, default: Date.now },

});
 
// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
