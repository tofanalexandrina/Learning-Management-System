import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './AdminCourseManagement.css';
import { GROUPS, getGroupName } from '../constants/groups';


const AdminCourseManagement = () => {
    const [professors, setProfessors]=useState([]);
    const [courses, setCourses]=useState([]);

    const [showForm, setShowForm]=useState(false);
    const [selectedProfessor, setSelectedProfessor]=useState(null);
    const [formData, setFormData]=useState({
        courseName:'',
        className:'',
        assignedGroups:[]
    });

    const fetchProfessors=async()=>{
        try{
            const response=await axios.get('http://localhost:5000/api/professor/all');
            setProfessors(response.data);
        }catch(err){
            console.error('Error fetching professors:', err);
        }
    }

    const fetchCourses=async()=>{
        try{
            const response=await axios.get('http://localhost:5000/api/course');
            setCourses(response.data);
        }catch(err){
            console.error('Error fetching courses:', err);
        }
    }

    useEffect(()=>{
        fetchProfessors();
        fetchCourses();
    }, []);

    const getProfessorCourses=(professorId)=>{
        return courses.filter(course=>course.professorId===professorId);
    };

    const handleAddCourseClick=(professor)=>{
        setSelectedProfessor(professor);
        setFormData({
            courseName:'',
            className:'',
            assignedGroups:professor.groups||[]
        });
        setShowForm(true);
    }

    const handleDeleteCourse=async(courseId)=>{
        if(window.confirm('Are you sure you want to delete this course?')){
            try{
                await axios.delete(`http://localhost:5000/api/course/${courseId}`);
                fetchCourses();
            }catch(err){
                console.error('Error deleting course:', err);
            }
        }
    }

    const handleCancelForm=()=>{
        setShowForm(false);
        setSelectedProfessor(null);
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();

        if(!formData.courseName||!formData.className){
            console.error('Course name and class are required');
            return;
        }

        try{
            const response=await axios.post('http://localhost:5000/api/course/create',{
                courseName: formData.courseName,
                professorId: selectedProfessor.professorId,
                class: formData.className,
                assignedGroups: formData.assignedGroups
            });
            setShowForm(false);
            setSelectedProfessor(null);

            fetchCourses();

        }catch(err){
            console.error('Error creating course:', err);
        }
    }

    const handleInputChange=(e)=>{
        const{name, value}=e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleGroupChange=(e)=>{
        const options=Array.from(e.target.selectedOptions).map(option=>option.value);
        setFormData({
            ...formData,
            assignedGroups: options
        });
    }

    return(
        <div className="course-management">
            <h2 className='section-title'>Course Management</h2>
            {!professors.length ? (
                <div className='loading-container'>Loading professors...</div>
            ):(
            <div className='professors-list'>
                {professors.map(professor=>{
                    const professorCourses=getProfessorCourses(professor.professorId);

                    return(
                        <div key={professor.professorId} className="professor-card">
                            <div className='professor-header'>
                                <h3>{professor.professorFirstName} {professor.professorLastName}</h3>
                                <button className='add-course-btn' onClick={()=>handleAddCourseClick(professor)}>+ Add Course</button>
                            </div>
                            <div className='professor-details'>
                                <p className='professor-email'>{professor.professorEmail}</p>
                                <p className='professor-groups'>
                                    <strong>Groups:</strong>{' '}
                                    {professor.groups&&professor.groups.length>0?
                                    professor.groups.map(id=>getGroupName(id)).join(', '):' No groups assigned'}
                                </p>
                            </div>

                            {professorCourses.length>0 ?(
                                <div className='professor-courses'>
                                    <h4>Courses:</h4>
                                    <div className='courses-grid'>
                                        {professorCourses.map(course=>(
                                            <div key={course.courseId} className='course-card'>
                                                <div className="course-header">
                                                    <h4 className='course-name'>{course.courseName}</h4>
                                                    <button className="delete-course-btn" onClick={()=>handleDeleteCourse(course.courseId)}title="Delete course">X</button>
                                                </div>
                                                <p className="course-class">Class: {course.class}</p>
                                                <p className="course-code">Access Code: {course.accessCode}</p>
                                                <div className="course-groups">
                                                    <p><strong>Assigned Groups:</strong></p>
                                                    <ul className="group-list">
                                                        {course.assignedGroups&&course.assignedGroups.length>0?(
                                                        course.assignedGroups.map(groupId=>(
                                                            <li key={groupId} className='group-item' >{getGroupName(groupId)}</li>
                                                        ))
                                                        ): (
                                                            <li className="no-groups">No groups assigned</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                            ))}
                                    </div>
                                </div>
                            ):(
                                <div className="no-courses">
                                        <p>No courses assigned to this professor yet.</p>
                                    </div>
                            )}
                        </div> 
                    )
                })}
            </div>
            )}

            {/*form to add new course*/}
            {showForm&&selectedProfessor&&(
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className='modal-header'>
                            <h3>Add Course for {selectedProfessor.professorFirstName} {selectedProfessor.professorLastName}</h3>
                            <button className='close-button' onClick={handleCancelForm}>X</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                        <div className="form-group">
                                <label htmlFor="courseName">Course Name</label>
                                <input
                                    type="text"
                                    id="courseName"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="className">Class/Year</label>
                                <input
                                    type="text"
                                    id="className"
                                    name="className"
                                    value={formData.className}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="assignedGroups">Assign to Groups</label>
                                <select
                                    id="assignedGroups"
                                    name="assignedGroups"
                                    multiple
                                    value={formData.assignedGroups}
                                    onChange={handleGroupChange}
                                >
                                    {GROUPS.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                                <small>Hold Ctrl to select multiple groups</small>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={handleCancelForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-button" >Add Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

}

export default AdminCourseManagement;