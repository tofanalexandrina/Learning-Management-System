const mongoose = require('mongoose');

const HomeworkAnswersSchema = new mongoose.Schema({
    answerId: { type: String, required: true, unique: true },
    homeworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    score: { type: Number },
    answerFiles: [{
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('HomeworkAnswers', HomeworkAnswersSchema);