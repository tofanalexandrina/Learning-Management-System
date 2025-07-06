const mongoose = require('mongoose');

const HomeworkAnswerSchema = new mongoose.Schema({
    answerId: { type: String, required: true, unique: true },
    homeworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    mark:{type: Number, min:0, max:10},
    answerFiles: [{
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now }
    }],
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HomeworkAnswer', HomeworkAnswerSchema);