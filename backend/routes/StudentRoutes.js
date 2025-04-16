const express = require('express');
const router = express.Router();
const StudentController=require('../controllers/StudentController');

router.post('/register', StudentController.registerStudent);
router.post('/login', StudentController.loginStudent);
router.post('/complete-registration', StudentController.completeRegistration);

module.exports = router;