const express=require('express');
const router=express.Router();
const ProfessorController=require('../controllers/ProfessorController');

router.post('/register', ProfessorController.registerProfessor);
router.post('/login', ProfessorController.loginProfessor);

module.exports=router;