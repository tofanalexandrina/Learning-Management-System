const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    studentFirstName: { type: String, required: true },
    studentLastName: { type: String, required: true },
    studentEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Number, required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    group: { type: String, required: true }
});

module.exports = mongoose.model('Students', StudentSchema);