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
    const [accessCode, setAccessCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [foundCourse, setFoundCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [enrollmentError, setEnrollmentError] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);

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


    const handleAccessCodeChange = (e) => {
        setAccessCode(e.target.value.trim().toUpperCase());
    };

    const handleSearchCourse = async (e) => {
        e.preventDefault();
        
        if (!accessCode) return;
        
        setIsSearching(true);
        setEnrollmentError('');
        
        try {
            const response = await axios.post('http://localhost:5000/api/course/find-by-code', {
                accessCode
            });
            
            setFoundCourse(response.data);
            setShowModal(true);
        } catch (err) {
            console.error('Error finding course:', err);
            if (err.response && err.response.status === 404) {
                setEnrollmentError('No course found with this access code');
            } else {
                setEnrollmentError('Error searching for course. Please try again.');
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleEnroll = async () => {
        if (!foundCourse || !studentId) return;
        
        setIsEnrolling(true);
        setEnrollmentError('');
        
        try {
            const response = await axios.post('http://localhost:5000/api/course/enroll-student', {
                courseId: foundCourse.courseId,
                studentId
            });
            
            // Add the new course to the courses list
            fetchCourses();
            
            // Close modal and reset
            setShowModal(false);
            setFoundCourse(null);
            setAccessCode('');
        } catch (err) {
            console.error('Error enrolling in course:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setEnrollmentError(err.response.data.error);
            } else {
                setEnrollmentError('Error enrolling in course. Please try again.');
            }
        }finally {
            setIsEnrolling(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setFoundCourse(null);
        setEnrollmentError('');
    };

    //fetch courses again after enrollment
    const fetchCourses = async () => {
        try {
            const coursesResponse = await axios.get('http://localhost:5000/api/course');
            const professorResponse = await axios.get('http://localhost:5000/api/professor/all');
            setProfessors(professorResponse.data);
            
            if (role === '2' && studentId) {
                try {
                    const studentResponse = await axios.get(`http://localhost:5000/api/student/${studentId}`);
                    const studentGroup = studentResponse.data.group;
                    const studentCourses = coursesResponse.data.filter(course =>
                        course.assignedGroups.includes(studentGroup)
                    );
                    setCourses(studentCourses);
                } catch (err) {
                    console.error('Error fetching student data:', err);
                }
            } else if (role === '1') {
                const professorCourses = coursesResponse.data.filter(course => {
                    return String(course.professorId) === String(professorId);
                });
                setCourses(professorCourses);
            }
        }catch (err) {
            console.error('Error fetching data:', err);
        }
    };

     useEffect(() => {
        fetchCourses();
    }, [role, studentId, professorId]);

    return (
        <div className='page-layout'>
            <div className='page-components'>
             {/* Student access code search form */}
                {role === '2' && (
                    <div className="course-code-search">
                        <form onSubmit={handleSearchCourse}>
                            <input
                                type="text"
                                placeholder="Enter course access code"
                                value={accessCode}
                                onChange={handleAccessCodeChange}
                                disabled={isSearching}
                            />
                            <button 
                                type="submit" 
                                disabled={isSearching || !accessCode}
                            >
                                {isSearching ? 'Searching...' : 'Enroll'}
                            </button>
                        </form>
                        {enrollmentError && !showModal && (
                            <div className="error-message">{enrollmentError}</div>
                        )}
                    </div>
                )}

                {/* Course enrollment modal */}
                {showModal && foundCourse && (
                    <div className="modal-overlay">
                        <div className="course-enrollment-modal">
                            <div className="modal-header">
                                <h3>Course Enrollment</h3>
                                <button className="close-button" onClick={closeModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="course-info">
                                    <p><strong>Course:</strong> {foundCourse.courseName}</p>
                                    <p><strong>Class:</strong> {foundCourse.class}</p>
                                    <p><strong>Professor:</strong> {foundCourse.professorName}</p>
                                </div>
                                {enrollmentError && (
                                    <div className="error-message">{enrollmentError}</div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button 
                                    className="cancel-btn" 
                                    onClick={closeModal}
                                    disabled={isEnrolling}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="enroll-btn"
                                    onClick={handleEnroll}
                                    disabled={isEnrolling}
                                >
                                    {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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