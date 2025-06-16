const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  studentFirstName: { type: String },
  studentLastName: { type: String },
  studentEmail: { type: String, required: true, unique: true },
  password: { type: String },
  group: { type: String },
  role: { type: Number },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('Student', StudentSchema);