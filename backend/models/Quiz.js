const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true } // Index of the correct option
});

const QuizSchema = new mongoose.Schema({
    quizId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    timeLimit: { type: Number, required: true }, // in minutes
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);