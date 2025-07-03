const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/QuizController');

// Routes for professors
router.post('/create', QuizController.createQuiz);
router.get('/course/:courseId', QuizController.getQuizzesByCourse);
router.put('/:quizId', QuizController.updateQuiz);
router.delete('/:quizId', QuizController.deleteQuiz);

// Routes for students
router.post('/submit', QuizController.submitQuiz);
router.get('/student-submission/:quizId/:studentId', QuizController.getStudentSubmission);
router.get('/submissions/:quizId', QuizController.getQuizSubmissions);

module.exports = router;