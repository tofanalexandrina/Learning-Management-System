const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.registerStudent = async (req, res) => {
    try {
        const { studentFirstName, studentLastName, studentEmail, password, group, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const studentId = uuidv4();
        const newStudent = new Student({
            studentId,
            studentFirstName,
            studentLastName,
            studentEmail,
            password: hashedPassword,
            role,
            courses: [],
            group
        });
        await newStudent.save();
        res.status(200).json({ message: 'Student registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering student', details: err.message });
    }
};

exports.loginStudent = async (req, res) => {
    const { studentEmail, password } = req.body;
    try {
        const student=await Student.findOne({studentEmail});
        if(student){
            const validPassword=await bcrypt.compare(password, student.password);
            if(validPassword){
                res.status(200).json({message: 'Login successful', firstName: student.studentFirstName, lastName: student.studentLastName, id: student.studentId, role: student.role});
            }else{
                res.status(400).json({error: 'Invalid password'});
            }
        }else{
            res.status(404).json({error: 'Student not found'});
        }
    }catch(err){
        res.status(500).json({error: 'Error logging in', details: err.message});
    }
};

