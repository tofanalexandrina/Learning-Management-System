const Course= require('../models/Course');
const Student = require('../models/Student');
const Professor = require('../models/Professor');
const { v4: uuidv4 } = require('uuid');

exports.createCourse=async(req, res)=>{
    try{
        const {courseName, professorId, class: className, assignedGroups} = req.body;

        const courseId = uuidv4();
        const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase(); 

        const newCourse = new Course({
            courseId,
            courseName,
            professorId,
            accessCode,
            class: className,
            assignedGroups: assignedGroups || []
        });

        await newCourse.save();

        //for autoenrolling students from assigned groups
        if(assignedGroups && assignedGroups.length>0){
            const professor=await Professor.findOne({professorId});
            if(professor){
                const newGroups=[];
                assignedGroups.forEach(group=>{
                    if(!professor.groups.includes(group)){
                        newGroups.push(group);
                    }
                });
                if(newGroups.length>0){
                    professor.groups=[...professor.groups, ...newGroups];
                    await professor.save();
                    console.log(`Updated professor groups: ${professor.groups}`);
                }
            }
            await this.enrollStudentsByGroups(newCourse._id, assignedGroups);
        }

        res.status(200).json({ 
            message: 'Course created successfully', 
            course: newCourse
        }); 
    }catch(err){
        console.error('Error creating course:', err);
        res.status(500).json({ error: 'Error creating course', details: err.message });
    }


};

exports.getAllCourses=async(req, res)=>{
    try{
        const courses=await Course.find();
        res.status(200).json(courses);
    }catch(err){
        res.status(500).json({ error: 'Error fetching courses', details: err.message});
    }
};

exports.getCourseById=async(req, res)=>{
    try{
        const course=await Course.findOne({courseId: req.params.id});
        if(!course){
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json(course);
    }catch(err){
        res.status(500).json({ error: 'Error fetching course', details: err.message });
    }
};

exports.updateCourse=async(req, res)=>{
    try{
        const {courseName, professorId, class: className, assignedGroups} = req.body;
        const courseId=req.params.id;
        const course=await Course.findOneAndUpdate({courseId});
        if(!course){
            return res.status(404).json({ error: 'Course not found' });
        }

        //updating course details
        if(courseName){
            course.courseName=courseName;
        }
        if(professorId){
            course.professorId=professorId;
        }
        if(className){
            course.class=className;
        }

        //handling changes in assigned groups
        if(assignedGroups){
            //finding groups that were added
            const addedGroups=assignedGroups.filter(group=>!course.assignedGroups.includes(group));
            //finding groups that were removed
            const removedGroups=course.assignedGroups.filter(group=>!assignedGroups.includes(group));
            //updating course assigned groups
            course.assignedGroups=assignedGroups;
            //enrolling students from added groups
            if(addedGroups.length>0){
                await this.enrollStudentsByGroups(course._id, addedGroups);
            }
            //unenrolling students from removed groups
            if(removedGroups.length>0){
                await this.unenrollStudentsByGroups(course._id, removedGroups);
            }
        }
        await course.save();
        res.status(200).json({ message: 'Course updated successfully', course });
    }catch(err){
        console.error('Error updating course:', err);
        res.status(500).json({ error: 'Error updating course', details: err.message });

    }
};

exports.deleteCourse=async(req, res)=>{
    try{
        const course = await Course.findOne({ courseId: req.params.id });
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        //removing course from all students enrolled
        await Student.updateMany(
            { courses: course._id },
            { $pull: { courses: course._id } }
        );

        //deleting course
        await Course.deleteOne({ courseId: req.params.id });
        res.status(200).json({ message: 'Course deleted successfully' });
    }catch(err){
        console.error('Error deleting course:', err);   
        res.status(500).json({ error: 'Error deleting course', details: err.message });
    }
};

exports.enrollStudentsByGroups = async function(courseId, groups) {
    try {
        const students = await Student.find({ group: { $in: groups } });
        
        const updatePromises = students.map(student => {
            if (!student.courses.includes(courseId)) {
                student.courses.push(courseId);
                return student.save();
            }
            return Promise.resolve();
        });
        
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error enrolling students by groups:', error);
        throw error;
    }
};

exports.unenrollStudentsByGroups = async function(courseId, groups) {
    try {
        const students = await Student.find({ group: { $in: groups } });
        
        const updatePromises = students.map(student => {
            student.courses = student.courses.filter(id => !id.equals(courseId));
            return student.save();
        });
        
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error unenrolling students by groups:', error);
        throw error;
    }
};


