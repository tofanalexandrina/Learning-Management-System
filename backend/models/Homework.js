const mongoose = require('mongoose');

const HomeworkSchema = new mongoose.Schema({
    homeworkId: { type: String, required: true, unique: true },
    homeworkTitle: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    homeworkDescription: { type: String, required: true },
    homeworkFiles: [{
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Homework', HomeworkSchema);