const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { v4: uuidv4 } = require('uuid');

// For professors to create a new quiz
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, courseId, timeLimit, startDate, endDate, questions } = req.body;

        if (!title || !description || !courseId || !timeLimit || !startDate || !endDate || !questions) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Generate unique ID for each question
        const processedQuestions = questions.map(question => ({
            ...question,
            questionId: uuidv4()
        }));

        const quizId = uuidv4();
        const newQuiz = new Quiz({
            quizId,
            title,
            description,
            courseId: course._id,
            timeLimit,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            questions: processedQuestions
        });

        await newQuiz.save();

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz: newQuiz
        });
    } catch (err) {
        console.error("Error creating quiz:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get quizzes for a specific course
exports.getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const quizzes = await Quiz.find({ courseId: course._id });
        res.status(200).json(quizzes);
    } catch (err) {
        console.error("Error fetching quizzes:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an existing quiz
exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title, description, timeLimit, startDate, endDate, questions } = req.body;

        const quiz = await Quiz.findOne({ quizId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Update quiz fields if provided
        if (title) quiz.title = title;
        if (description) quiz.description = description;
        if (timeLimit) quiz.timeLimit = timeLimit;
        if (startDate) quiz.startDate = new Date(startDate);
        if (endDate) quiz.endDate = new Date(endDate);
        
        if (questions) {
            // Process each question to ensure it has a questionId
            const processedQuestions = questions.map(question => {
                if (!question.questionId) {
                    return { ...question, questionId: uuidv4() };
                }
                return question;
            });
            
            quiz.questions = processedQuestions;
        }

        await quiz.save();
        res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            quiz
        });
    } catch (err) {
        console.error("Error updating quiz:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findOne({ quizId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Delete all submissions for this quiz
        await QuizSubmission.deleteMany({ quizId: quiz._id });
        
        // Delete the quiz
        await Quiz.deleteOne({ quizId });
        
        res.status(200).json({
            success: true,
            message: 'Quiz and all related submissions deleted successfully'
        });
    } catch (err) {
        console.error("Error deleting quiz:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// For students to submit a quiz
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, studentId, answers } = req.body;

        if (!quizId || !studentId || !answers) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const quiz = await Quiz.findOne({ quizId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Calculate score
        let correctCount = 0;
        quiz.questions.forEach((question, index) => {
            if (index < answers.length && answers[index] === question.correctOption) {
                correctCount++;
            }
        });

        const score = correctCount;
        const totalQuestions = quiz.questions.length;
        const percentage = (score / totalQuestions) * 100;

        // Check if student has already submitted this quiz
        const existingSubmission = await QuizSubmission.findOne({
            quizId: quiz._id,
            studentId: student._id
        });

        const submissionId = existingSubmission ? existingSubmission.submissionId : uuidv4();

        if (existingSubmission) {
            // Update existing submission
            existingSubmission.answers = answers;
            existingSubmission.score = score;
            existingSubmission.totalQuestions = totalQuestions;
            existingSubmission.percentage = percentage;
            existingSubmission.submittedAt = new Date();
            
            await existingSubmission.save();
            
            res.status(200).json({
                success: true,
                message: 'Quiz submission updated successfully',
                submission: existingSubmission
            });
        } else {
            // Create new submission
            const newSubmission = new QuizSubmission({
                submissionId,
                quizId: quiz._id,
                studentId: student._id,
                answers,
                score,
                totalQuestions,
                percentage
            });

            await newSubmission.save();
            
            res.status(201).json({
                success: true,
                message: 'Quiz submitted successfully',
                submission: newSubmission
            });
        }
    } catch (err) {
        console.error("Error submitting quiz:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a student's submission for a specific quiz
exports.getStudentSubmission = async (req, res) => {
    try {
        const { quizId, studentId } = req.params;

        const quiz = await Quiz.findOne({ quizId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const submission = await QuizSubmission.findOne({
            quizId: quiz._id,
            studentId: student._id
        });

        res.status(200).json(submission || null);
    } catch (err) {
        console.error("Error fetching student submission:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// For professors to get all submissions for a quiz
exports.getQuizSubmissions = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findOne({ quizId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const submissions = await QuizSubmission.find({ quizId: quiz._id })
            .populate({
                path: 'studentId',
                select: 'studentFirstName studentLastName studentId group'
            });

        res.status(200).json(submissions);
    } catch (err) {
        console.error("Error fetching quiz submissions:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//for professors to get all groups that have submissions for a specific quiz
exports.getQuizSubmissionGroups=async(req, res)=>{
    try{
        const {quizId}=req.params;
        const quiz=await Quiz.findOne({quizId});
        if(!quiz){
            return res.status(404).json({message:'Quiz not found'});
        }
        //get all submissions
        const submissions=await QuizSubmission.find({quizId: quiz._id});
        if(submissions.length===0){
            return res.status(200).json([]);
        }

        //get student ids
        const studentIds=submissions.map(submission=>submission.studentId);
        //get students with the ids
        const students=await Student.find({_id:{$in:studentIds}});
        //extract unique groups
        const groups=[...new Set(students.map(student=>student.group))];
        res.status(200).json(groups);

    }catch(err){
        console.error("Error fetching submission groups:", err);
        res.status(500).json({message:"Error fetching submissions"});
    }
}

//for professors to get quiz submissions by group
exports.getQuizSubmissionsByGroup=async(req, res)=>{
    try{
        const {quizId, groupId}=req.params;
        const quiz=await Quiz.findOne({quizId});
        if(!quiz){
            return res.status(404).json({message:'Quiz not found'});
        }

        //find all students in specified group
        const students=await Student.find({group: groupId});
        if(students.length===0){
            return res.status(200).json([]);
        }

        //extract student ids for query
        const studentIds=students.map(student=>student._id);
        //get submissions that match the quiz and students
        const submissions=await QuizSubmission.find({
            quizId:quiz._id,
            studentId:{$in:studentIds}
        }).populate({
            path:'studentId',
            select:'studentFirstName studentLastName studentId'
        });

        res.status(200).json(submissions);

    }catch(err){
        console.error("Error fetching quiz submissions by group:", err);
        res.status(500).json({message:'Error fetching submissions'});
    }
};