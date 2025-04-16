const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/EmailController');

router.post('/send-student-invite', EmailController.sendStudentInvite);
router.post('/send-professor-invite', EmailController.sendProfessorInvite);

module.exports = router;