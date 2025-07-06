const express = require('express');
const router = express.Router();
const HomeworkController = require('../controllers/HomeworkController');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes for professors
router.post('/create', upload.single('homeworkFile'), HomeworkController.createHomework);
router.get('/course/:courseId', HomeworkController.getHomeworksByCourse);
router.get('/download/:homeworkId', HomeworkController.downloadHomework);
router.get('/submissions/groups/:homeworkId', HomeworkController.getHomeworkSubmissionGroups);
router.get('/submissions/:homeworkId/:groupId', HomeworkController.getHomeworkSubmissionsByGroup);
router.post('/assign-mark', HomeworkController.assignMark);

// Routes for students
router.post('/submit', upload.single('answerFile'), HomeworkController.submitHomeworkAnswer);
router.get('/answer/download/:answerId', HomeworkController.downloadHomeworkAnswer);
router.get('/student-submission/:homeworkId/:studentId', HomeworkController.getStudentSubmission);

module.exports = router;