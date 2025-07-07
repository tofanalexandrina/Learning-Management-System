const express=require('express');
const router=express.Router();
const CourseController=require('../controllers/CourseController');

router.post('/create', CourseController.createCourse);
router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getCourseById);
router.put('/:id', CourseController.updateCourse);
router.delete('/:id', CourseController.deleteCourse);
router.post('/find-by-code', CourseController.findCourseByAccessCode);
router.post('/enroll-student', CourseController.enrollStudent);

module.exports=router;