import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {getGroupName} from '../constants/groups';
import MaterialsView from '../components/MaterialsView';
import HomeworksView from '../components/HomeworksView';
import QuizzesView from '../components/QuizzesView';
import './CourseView.css'; 

const CourseView = () => {
    const {courseId} = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('materials');

    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const courseResponse = await axios.get(`http://localhost:5000/api/course/${courseId}`);
                setCourse(courseResponse.data);
            } catch(err) {
                console.error("Error fetching course data:", err);
                setError('Failed to load course. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchCourseData();
    }, [courseId]);

    if (loading) {
        return (
            <div className='page-layout'>
                <div className='page-components'>
                    <div className="loading-container">Loading course content...</div>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className='page-layout'>
                <div className='page-components'>
                    <div className="error-container">
                        <p>{error || "Course not found"}</p>
                        <button onClick={() => navigate('/courses')}>Back to Courses</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='page-layout'>
            <div className='page-components course-view-container'>
                <div className='course-header'>
                    <div className='course-title-container'>
                        <h1 className='page-title'>{course.courseName}</h1>
                        <div className='course-meta'>
                            <span className='course-class-view'>{course.class}</span>
                            {role === '1' && (
                                <span className='course-code-view'>Access Code: {course.accessCode}</span>
                            )}
                            {role === '1' && (
                                <span className='course-groups-view'>Groups: {course.assignedGroups.map(group => getGroupName(group)).join(', ')}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className='course-tabs'>
                    <button className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Materials</button>
                    <button className={`tab-button ${activeTab === 'homeworks' ? 'active' : ''}`} onClick={() => setActiveTab('homeworks')}>Homeworks</button>
                    <button className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab('quizzes')}>Quizzes</button>
                </div>
                <div className='tab-content'>
                    {activeTab === 'materials' && (
                        <MaterialsView courseId={courseId} isProfessor={role === '1'} />
                    )}
                    {activeTab === 'homeworks' && (
                        <HomeworksView courseId={courseId} isProfessor={role === '1'} />
                    )}
                    {activeTab === 'quizzes' && (
                        <QuizzesView courseId={courseId} isProfessor={role === '1'} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseView;