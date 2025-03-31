const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseId: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
    accessCode: { type: String, required: true },
    class: { type: String, required: true }
});

module.exports = mongoose.model('Courses', CourseSchema);