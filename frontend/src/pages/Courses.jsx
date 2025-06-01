import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './NavBarPages.css';
import './Courses.css';
import {getGroupName} from '../constants/groups';
import {useNavigate} from 'react-router-dom';

const Courses = () => {
    const navigate=useNavigate();
    const [courses, setCourses] = useState([]);
    const [professors, setProfessors]= useState([]);

    const role=localStorage.getItem('role');
    const studentId=localStorage.getItem('studentId');
    const professorId=localStorage.getItem('professorId');

    const getProfessorName=(professorId)=>{
        const professor=professors.find(professor=>professor.professorId===professorId);
        return professor ? `${professor.professorFirstName} ${professor.professorLastName}`:'Uknown';
    }
    const getGroupNames=(groupIds)=>{
        return groupIds.map(id=>getGroupName(id)).join(', ');
    }

    const handleViewCourse=(courseId)=>{
        navigate(`/course/${courseId}`);
    }

    useEffect(()=>{
        const fetchData=async()=>{
            try{
                const professorResponse=await axios.get('http://localhost:5000/api/professor/all');
                setProfessors(professorResponse.data);

                console.log('Role:', role);
                console.log('Student ID:', studentId);
                console.log('Professor ID:', professorId);
                const coursesResponse = await axios.get('http://localhost:5000/api/course');

                //student
                if(role==='2'&&studentId){
                    try{
                    //getting student group
                    const studentResponse=await axios.get(`http://localhost:5000/api/student/${studentId}`);
                    const studentGroup=studentResponse.data.group;
                    //filtering courses by group
                    const studentCourses=coursesResponse.data.filter(course=>
                        course.assignedGroups.includes(studentGroup)
                    );
                    setCourses(studentCourses);
                } catch(err){
                    console.error('Error fetching student data:', err);
                }
                }
                //profesor
                else if(role==='1'){
                    const professorCourses=coursesResponse.data.filter(course=>{
                       return String(course.professorId) === String(professorId);
                    }
                    );
                    setCourses(professorCourses);
                }
            }catch(err){
                console.error('Error fetching data:', err);
            }
        }
        fetchData();
    }, [role, studentId, professorId]);
    return (
        <div className='page-layout'>
            <div className='page-components'>
            {courses.length ===0 ? (
                console.log('No courses found for this user.')
            ):(
                <div className='courses-grid'>
                    {courses.map(course=>(
                        <div key={course.courseId} className='course-card'>
                            <div className='course-header-main'>
                                <h3 className='course-name'>{course.courseName}</h3>
                                <span className='course-class'>{course.class}</span>
                            </div>
                            <div className="course-details">
                                    {role === '2' ? (
                                        <div className="professor-info">
                                            <p>Professor: {getProfessorName(course.professorId)}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="groups-info">
                                                <p>Groups: {getGroupNames(course.assignedGroups)}</p>
                                            </div>
                                            <div className="course-code">
                                                <p>Access Code: {course.accessCode}</p>
                                            </div>
                                        </>
                                        
                                    )}
                             </div>  
                            <button className="enter-course-btn" onClick={()=>handleViewCourse(course.courseId)}>View Course</button>

                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default Courses;