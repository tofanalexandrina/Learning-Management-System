const mongoose = require('mongoose');

const QuizSubmissionSchema = new mongoose.Schema({
    submissionId: { type: String, required: true, unique: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    answers: [{ type: Number }], // Array of selected option indexes
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizSubmission', QuizSubmissionSchema);