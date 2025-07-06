const Homework = require('../models/Homework');
const HomeworkAnswer = require('../models/HomeworkAnswers');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Create upload directories if they don't exist
const HOMEWORKS_DIR = path.join(__dirname, '../uploads/homeworks');
const ANSWERS_DIR = path.join(__dirname, '../uploads/homework_answers');

if (!fs.existsSync(HOMEWORKS_DIR)) {
    fs.mkdirSync(HOMEWORKS_DIR, { recursive: true });
}

if (!fs.existsSync(ANSWERS_DIR)) {
    fs.mkdirSync(ANSWERS_DIR, { recursive: true });
}

// For professors to create a new homework assignment
exports.createHomework = async (req, res) => {
    try {
        const { homeworkTitle, homeworkDescription, courseId, dueDate } = req.body;

        if (!homeworkTitle || !homeworkDescription || !courseId) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const homeworkId = uuidv4();
        let homeworkFiles = [];

        // Process uploaded file if any
        if (req.file) {
            const file = req.file;
            const fileName = file.originalname;
            const filePath = `${homeworkId}-${fileName}`;

            // Save file to disk
            const fileDestination = path.join(HOMEWORKS_DIR, filePath);
            fs.writeFileSync(fileDestination, file.buffer);

            homeworkFiles.push({
                fileName,
                filePath,
                uploadDate: new Date()
            });
        }

        const newHomework = new Homework({
            homeworkId,
            homeworkTitle,
            courseId: course._id,
            homeworkDescription,
            dueDate: dueDate || null,
            homeworkFiles
        });

        await newHomework.save();

        res.status(201).json({
            success: true,
            message: 'Homework created successfully',
            homework: newHomework
        });
    } catch (err) {
        console.error("Error creating homework:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get homeworks for a specific course
exports.getHomeworksByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const homeworks = await Homework.find({ courseId: course._id });
        res.status(200).json(homeworks);
    } catch (err) {
        console.error("Error fetching homeworks:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Download a specific homework file
exports.downloadHomework = async (req, res) => {
    try {
        const { homeworkId } = req.params;

        const homework = await Homework.findOne({ homeworkId });
        if (!homework || homework.homeworkFiles.length === 0) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        const file = homework.homeworkFiles[0];
        const filePath = path.join(HOMEWORKS_DIR, file.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.download(filePath, file.fileName);
    } catch (err) {
        console.error("Error downloading homework:", err);
        res.status(500).json({ message: 'Error downloading homework' });
    }
};

// Get student's own submission
exports.getStudentSubmission = async (req, res) => {
    try {
        const { homeworkId, studentId } = req.params;
        
        // Find the homework
        const homework = await Homework.findOne({ homeworkId });
        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }
        
        // Find the student
        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Find submission
        const submission = await HomeworkAnswer.findOne({ 
            homeworkId: homework._id,
            studentId: student._id
        });
        
        res.status(200).json(submission || null);
    } catch (err) {
        console.error("Error fetching student submission:", err);
        res.status(500).json({ message: 'Error fetching submission' });
    }
};

// For students to submit a homework answer
exports.submitHomeworkAnswer = async (req, res) => {
    try {
        const { homeworkId, studentId } = req.body;

        if (!homeworkId || !studentId) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const homework = await Homework.findOne({ homeworkId });
        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        const answerId = uuidv4();
        const file = req.file;
        const fileName = file.originalname;
        const filePath = `${answerId}-${fileName}`;

        // Save file to disk
        const fileDestination = path.join(ANSWERS_DIR, filePath);
        fs.writeFileSync(fileDestination, file.buffer);

        // Check if student has already submitted an answer
        const existingAnswer = await HomeworkAnswer.findOne({ 
            homeworkId: homework._id, 
            studentId: student._id 
        });

        if (existingAnswer) {
            // Update existing answer
            existingAnswer.answerFiles = [{
                fileName,
                filePath,
                uploadDate: new Date()
            }];
            await existingAnswer.save();
            res.status(200).json({
                success: true,
                message: 'Answer updated successfully',
                answerId: existingAnswer.answerId,
                answer: existingAnswer
            });
        } else {
            // Create new answer
            const newAnswer = new HomeworkAnswer({
                answerId,
                homeworkId: homework._id,
                studentId: student._id,
                answerFiles: [{
                    fileName,
                    filePath,
                    uploadDate: new Date()
                }]
            });

            await newAnswer.save();
            res.status(201).json({
                success: true,
                message: 'Answer submitted successfully',
                answerId,
                answer: newAnswer
            });
        }
    } catch (err) {
        console.error("Error submitting homework answer:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// For professors to get homework submissions by group
exports.getHomeworkSubmissionsByGroup = async (req, res) => {
    try {
        const { homeworkId, groupId } = req.params;
        console.log(`Fetching submissions for homework: ${homeworkId}, group: ${groupId}`);
        
        // Find homework using the string ID from URL
        const homework = await Homework.findOne({ homeworkId });
        if (!homework) {
            console.log(`Homework with ID ${homeworkId} not found`);
            return res.status(404).json({ message: 'Homework not found' });
        }
        
        // Find all students in the specified group
        const students = await Student.find({ group: groupId });
        console.log(`Found ${students.length} students in group ${groupId}`);
        
        if (students.length === 0) {
            return res.status(200).json([]);
        }
        
        // Extract student IDs for the query
        const studentIds = students.map(student => student._id);
        
        // Get submissions that match the homework and students
        const submissions = await HomeworkAnswer.find({
            homeworkId: homework._id,
            studentId: { $in: studentIds }
        }).populate({
            path: 'studentId',
            select: 'studentFirstName studentLastName studentId'
        });
        
        console.log(`Found ${submissions.length} submissions`);
        res.status(200).json(submissions);
    } catch (err) {
        console.error("Error fetching homework submissions by group:", err);
        res.status(500).json({ message: 'Error fetching submissions: ' + err.message });
    }
};

// Download a specific homework answer
exports.downloadHomeworkAnswer = async (req, res) => {
    try {
        const { answerId } = req.params;

        const answer = await HomeworkAnswer.findOne({ answerId });
        if (!answer || answer.answerFiles.length === 0) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        const file = answer.answerFiles[0];
        const filePath = path.join(ANSWERS_DIR, file.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.download(filePath, file.fileName);
    } catch (err) {
        console.error("Error downloading homework answer:", err);
        res.status(500).json({ message: 'Error downloading homework answer' });
    }
};

// For professors to get all groups that have submissions for a specific homework
exports.getHomeworkSubmissionGroups = async (req, res) => {
    try {
        const { homeworkId } = req.params;
        console.log(`Looking for homework submissions groups for homeworkId: ${homeworkId}`);
        
        const homework = await Homework.findOne({ homeworkId });
        if (!homework) {
            console.log(`No homework found with id ${homeworkId}`);
            return res.status(404).json({ message: 'Homework not found' });
        }
        console.log(`Found homework: ${homework._id}`);
        
        // Get all answers for this homework
        const answers = await HomeworkAnswer.find({ homeworkId: homework._id });
        console.log(`Found ${answers.length} answers`);
        
        if (answers.length === 0) {
            return res.status(200).json([]);
        }
        
        // Get the student IDs
        const studentIds = answers.map(answer => answer.studentId);
        console.log(`Student IDs: ${studentIds}`);
        
        // Verify Student model is loaded correctly
        console.log(`Student model: ${typeof Student}`);
        if (!Student || typeof Student.find !== 'function') {
            console.error('Student model is not correctly loaded');
            return res.status(500).json({ message: 'Internal server error - Student model not available' });
        }
        
        // Get the students with these IDs
        const students = await Student.find({ _id: { $in: studentIds } });
        console.log(`Found ${students.length} students`);
        
        // Extract unique groups
        const groups = [...new Set(students.map(student => student.group))];
        console.log(`Groups: ${groups}`);
        
        res.status(200).json(groups);
    } catch (err) {
        console.error("Error fetching submission groups:", err);
        res.status(500).json({ message: 'Error fetching submissions: ' + err.message });
    }
};

exports.assignMark=async(req, res)=>{
    try{
        const {answerId, mark}=req.body;
        if(!answerId||mark===undefined||mark===null){
            return res.status(400).json({message:'Required fields missing'});
        }

        const markValue=Number(mark);
        if(isNaN(markValue)||markValue<0||markValue>10){
            return res.status(400).json({message:'Mark must be a number between 0 and 10'});
        }

        const submission=await HomeworkAnswer.findOne({answerId});
        if(!submission){
            return res.statur(404).json({message:'Submission not found'});
        }

        submission.mark=markValue;
        await submission.save();

        res.status(200).json({
            success:true,
            message:'Mark assigned successfully',
            submission
        });

    }catch(err){
        console.error("Error assigning mark:", err);
        res.status(500).json({message:"Internal server error"});
    }
}