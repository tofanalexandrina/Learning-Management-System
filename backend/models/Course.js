const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseId: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    professorId: { type: String, ref: 'Professor', required: true },
    accessCode: { type: String, required: true },
    class: { type: String, required: true },
    assignedGroups: [{ type: String, required: true }],
    courseWeeks:[{
        weekId: String,
        startDate: Date,
        endDate: Date,
        title: String,
        materials: [{
            materialId: {type: String, ref: 'Material'}
        }],
        homeworks:[{
            homeworkId:{type: String, ref: 'Homework'}
        }],
        quizzes: [{
            quizId: {type: String, ref: 'Quiz'}
        }]
    }]
}); 

module.exports = mongoose.model('Courses', CourseSchema);