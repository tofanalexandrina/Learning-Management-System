import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getGroupName } from '../constants/groups';
import './HomeworksView.css';

const HomeworksView = ({ courseId, isProfessor }) => {
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        dueDate: '',
        file: null
    });
    const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
    
    // For student submissions
    const [studentSubmissions, setStudentSubmissions] = useState({});
    const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });
    const [submitting, setSubmitting] = useState(false);

    // For professor viewing submissions
    const [viewingSubmissions, setViewingSubmissions] = useState(false);
    const [submissionGroups, setSubmissionGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupSubmissions, setGroupSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [currentHomeworkId, setCurrentHomeworkId] = useState(null);

    const studentId = localStorage.getItem('studentId');

    useEffect(() => {
        fetchHomeworks();
    }, [courseId]);

    useEffect(() => {
        if (!isProfessor && homeworks.length > 0 && studentId) {
            fetchStudentSubmissions();
        }
    }, [homeworks, isProfessor, studentId]);

    const fetchHomeworks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/homework/course/${courseId}`);
            setHomeworks(response.data);
            setError('');
        } catch (err) {
            console.error("Error fetching homeworks:", err);
            setError('Failed to load homeworks.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentSubmissions = async () => {
        try {
            const submissionData = {};
            
            // Get submission for each homework
            for (const homework of homeworks) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/homework/student-submission/${homework.homeworkId}/${studentId}`);
                    if (response.data) {
                        submissionData[homework.homeworkId] = response.data;
                    }
                } catch (err) {
                    console.error(`Error fetching submission for homework ${homework.homeworkId}:`, err);
                }
            }
            
            setStudentSubmissions(submissionData);
        } catch (err) {
            console.error("Error fetching student submissions:", err);
        }
    };

    // Check if due date has passed
    const isDueDatePassed = (dueDate) => {
        if (!dueDate) return false;
        return new Date() > new Date(dueDate);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUploadForm({ ...uploadForm, [name]: value });
    };

    const handleFileChange = (e) => {
        setUploadForm({ ...uploadForm, file: e.target.files[0] });
    };

    const handleSubmissionFileChange = (e) => {
        setSubmissionFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!uploadForm.title || !uploadForm.description) {
            setUploadStatus({ message: 'Title and description are required', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('homeworkTitle', uploadForm.title);
            formData.append('homeworkDescription', uploadForm.description);
            formData.append('courseId', courseId);
            
            if (uploadForm.dueDate) {
                formData.append('dueDate', uploadForm.dueDate);
            }
            
            if (uploadForm.file) {
                formData.append('homeworkFile', uploadForm.file);
            }

            await axios.post('http://localhost:5000/api/homework/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setUploadStatus({ message: 'Homework created successfully', type: 'success' });
            setUploadForm({ title: '', description: '', dueDate: '', file: null });

            // Refresh homeworks list
            fetchHomeworks();

            // Hide form after upload
            setTimeout(() => {
                setShowUploadForm(false);
                setUploadStatus({ message: '', type: '' });
            }, 2000);
        } catch (err) {
            console.error("Error creating homework:", err);
            setUploadStatus({ message: 'Failed to create homework', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitHomework = async (homeworkId) => {
        if (!submissionFile) {
            setSubmitStatus({ message: 'Please select a file to submit', type: 'error' });
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('homeworkId', homeworkId);
            formData.append('studentId', studentId);
            formData.append('answerFile', submissionFile);

            const response = await axios.post('http://localhost:5000/api/homework/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setSubmitStatus({ message: 'Homework submitted successfully', type: 'success' });
            setSubmissionFile(null);
            setSelectedHomeworkId(null);
            
            // Update the submissions state with the new submission
            setStudentSubmissions({
                ...studentSubmissions,
                [homeworkId]: response.data.answer
            });
            
            setTimeout(() => {
                setSubmitStatus({ message: '', type: '' });
            }, 2000);
        } catch (err) {
            console.error("Error submitting homework:", err);
            setSubmitStatus({ message: 'Failed to submit homework', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownload = async (homeworkId, fileName) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/homework/download/${homeworkId}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Error downloading homework:", err);
            alert('Failed to download homework.');
        }
    };

    const handleDownloadSubmission = async (answerId, fileName) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/homework/answer/download/${answerId}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Error downloading submission:", err);
            alert('Failed to download submission.');
        }
    };

    const handleViewSubmissions = async (homeworkId) => {
        setViewingSubmissions(true);
        setCurrentHomeworkId(homeworkId);
        
        try {
            setLoadingSubmissions(true);
            const response = await axios.get(`http://localhost:5000/api/homework/submissions/groups/${homeworkId}`);
            setSubmissionGroups(response.data);
            setSelectedGroup(null);
            setGroupSubmissions([]);
        } catch (err) {
            console.error("Error fetching submission groups:", err);
            alert('Failed to load submission groups.');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleCloseSubmissions = () => {
        setViewingSubmissions(false);
        setCurrentHomeworkId(null);
        setSubmissionGroups([]);
        setSelectedGroup(null);
        setGroupSubmissions([]);
    };

    const handleSelectGroup = async (groupId) => {
        try {
            setLoadingSubmissions(true);
            const response = await axios.get(`http://localhost:5000/api/homework/submissions/${currentHomeworkId}/${groupId}`);
            setGroupSubmissions(response.data);
            setSelectedGroup(groupId);
        } catch (err) {
            console.error("Error fetching group submissions:", err);
            alert('Failed to load group submissions.');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    if (loading && homeworks.length === 0) {
        return <div className="loading-container">Loading homeworks...</div>;
    }

    return (
        <div className="homeworks-view">
            <div className="homeworks-header">
                <h2>Homework Assignments</h2>
                {isProfessor && !viewingSubmissions && (
                    <button 
                        className="upload-btn" 
                        onClick={() => setShowUploadForm(!showUploadForm)}
                    >
                        {showUploadForm ? 'Cancel' : '+ Create Homework'}
                    </button>
                )}
                {viewingSubmissions && (
                    <button 
                        className="back-btn" 
                        onClick={handleCloseSubmissions}
                    >
                        Back to Assignments
                    </button>
                )}
            </div>
            
            {error && <div className="homeworks-error">{error}</div>}
            
            {/* Professor's view for creating new homework */}
            {isProfessor && showUploadForm && !viewingSubmissions && (
                <div className="homework-upload-form">
                    <h3>Create New Homework</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={uploadForm.title} 
                                onChange={handleInputChange} 
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea 
                                name="description" 
                                value={uploadForm.description} 
                                onChange={handleInputChange} 
                                required
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label>Due Date (Optional)</label>
                            <input 
                                type="datetime-local" 
                                name="dueDate" 
                                value={uploadForm.dueDate} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Attachment (Optional)</label>
                            <input 
                                type="file" 
                                name="file" 
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar" 
                                onChange={handleFileChange}
                            />
                        </div>
                        
                        {uploadStatus.message && (
                            <div className={`upload-status ${uploadStatus.type}`}>
                                {uploadStatus.message}
                            </div>
                        )}
                        
                        <div className="form-actions">
                            <button type="submit" className="submit-btn">Create Homework</button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Professor's view for viewing submissions */}
            {isProfessor && viewingSubmissions && (
                <div className="submissions-view">
                    <h3>Submissions for Homework</h3>
                    
                    {loadingSubmissions ? (
                        <div className="loading-submissions">Loading submissions...</div>
                    ) : (
                        <div className="submissions-content">
                            {submissionGroups.length === 0 ? (
                                <div className="no-submissions">
                                    No submissions available for this homework yet.
                                </div>
                            ) : (
                                <div className="submission-groups">
                                    <div className="groups-list">
                                        <h4>Groups with Submissions:</h4>
                                        <div className="group-buttons">
                                            {submissionGroups.map(groupId => (
                                                <button 
                                                    key={groupId}
                                                    className={`group-btn ${selectedGroup === groupId ? 'active' : ''}`}
                                                    onClick={() => handleSelectGroup(groupId)}
                                                >
                                                    {getGroupName(groupId)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {selectedGroup && (
                                        <div className="group-submissions">
                                            <h4>Submissions from {getGroupName(selectedGroup)}:</h4>
                                            
                                            {groupSubmissions.length === 0 ? (
                                                <div className="no-submissions">
                                                    No submissions available from this group.
                                                </div>
                                            ) : (
                                                <div className="submissions-list">
                                                    {groupSubmissions.map(submission => (
                                                        <div key={submission.answerId} className="submission-item">
                                                            <div className="submission-info">
                                                                <div className="student-name">
                                                                    <span className="label">Student:</span>
                                                                    <span className="value">
                                                                        {submission.studentId.studentFirstName} {submission.studentId.studentLastName}
                                                                    </span>
                                                                </div>
                                                                <div className="submission-date">
                                                                    <span className="label">Submitted:</span>
                                                                    <span className="value">
                                                                        {new Date(submission.answerFiles[0].uploadDate).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="file-name">
                                                                    <span className="label">File:</span>
                                                                    <span className="value">
                                                                        {submission.answerFiles[0].fileName}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                className="download-btn"
                                                                onClick={() => handleDownloadSubmission(
                                                                    submission.answerId, 
                                                                    submission.answerFiles[0].fileName
                                                                )}
                                                            >
                                                                Download
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {/* List of homework assignments */}
            {!viewingSubmissions && (
                <div className="homeworks-list">
                    {homeworks.length === 0 ? (
                        <div className="no-homeworks">
                            <p>No homework assignments available for this course yet.</p>
                        </div>
                    ) : (
                        homeworks.map(homework => (
                            <div key={homework.homeworkId} className="homework-card">
                                <div className="homework-info">
                                    <h3>{homework.homeworkTitle}</h3>
                                    <p className="homework-description">{homework.homeworkDescription}</p>
                                    {homework.dueDate && (
                                        <p className={`due-date ${isDueDatePassed(homework.dueDate) ? 'overdue' : ''}`}>
                                            Due: {new Date(homework.dueDate).toLocaleString()}
                                            {isDueDatePassed(homework.dueDate) && !isProfessor && (
                                                <span className="overdue-label"> (Overdue)</span>
                                            )}
                                        </p>
                                    )}
                                    <p className="upload-date">
                                        Created on {new Date(homework.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                {/* Homework files section */}
                                {homework.homeworkFiles && homework.homeworkFiles.length > 0 && (
                                    <div className="homework-files">
                                        <h4>Assignment Files:</h4>
                                        {homework.homeworkFiles.map(file => (
                                            <button 
                                                key={file._id}
                                                className="download-btn"
                                                onClick={() => handleDownload(homework.homeworkId, file.fileName)}
                                            >
                                                Download {file.fileName}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Student's view for submitting homework */}
                                {!isProfessor && (
                                    <div className="student-submission-container">
                                        {studentSubmissions[homework.homeworkId] ? (
                                            <div className="student-submission-info">
                                                <h4>Your Submission:</h4>
                                                <div className="submission-details">
                                                    <p>
                                                        <span className="label">File:</span>
                                                        <span className="value">
                                                            {studentSubmissions[homework.homeworkId].answerFiles[0].fileName}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="label">Submitted:</span>
                                                        <span className="value">
                                                            {new Date(studentSubmissions[homework.homeworkId].answerFiles[0].uploadDate).toLocaleString()}
                                                        </span>
                                                    </p>
                                                    <button 
                                                        className="download-submission-btn"
                                                        onClick={() => handleDownloadSubmission(
                                                            studentSubmissions[homework.homeworkId].answerId, 
                                                            studentSubmissions[homework.homeworkId].answerFiles[0].fileName
                                                        )}
                                                    >
                                                        Download Your Submission
                                                    </button>
                                                </div>
                                            </div>
                                        ) : selectedHomeworkId === homework.homeworkId ? (
                                            <div className="submission-form">
                                                <h4>Submit Your Solution</h4>
                                                <div className="file-upload-container">
                                                    <input 
                                                        type="file" 
                                                        onChange={handleSubmissionFileChange}
                                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                                                    />
                                                </div>
                                                
                                                {submitStatus.message && (
                                                    <div className={`submit-status ${submitStatus.type}`}>
                                                        {submitStatus.message}
                                                    </div>
                                                )}
                                                
                                                <div className="submission-actions">
                                                    <button 
                                                        className="cancel-btn"
                                                        onClick={() => setSelectedHomeworkId(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        className="submit-btn"
                                                        onClick={() => handleSubmitHomework(homework.homeworkId)}
                                                        disabled={submitting || !submissionFile}
                                                    >
                                                        {submitting ? 'Submitting...' : 'Submit'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            isDueDatePassed(homework.dueDate) ? (
                                                <button 
                                                    className="submit-homework-btn disabled"
                                                    disabled={true}
                                                >
                                                    Due date has passed
                                                </button>
                                            ) : (
                                                <button 
                                                    className="submit-homework-btn"
                                                    onClick={() => setSelectedHomeworkId(homework.homeworkId)}
                                                >
                                                    Submit Solution
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                                
                                {/* Professor's view for viewing submissions by group */}
                                {isProfessor && (
                                    <div className="view-submissions-container">
                                        <button 
                                            className="view-submissions-btn"
                                            onClick={() => handleViewSubmissions(homework.homeworkId)}
                                        >
                                            View Student Submissions
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default HomeworksView;