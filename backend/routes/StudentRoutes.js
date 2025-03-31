const express = require('express');
const router = express.Router();
const StudentController=require('../controllers/StudentController');

router.post('/register', StudentController.registerStudent);
router.post('/login', StudentController.loginStudent);

module.exports = router;