import React, { useState, useEffect } from 'react';
import './QuizzesView.css';

const QuizzesView = ({ courseId, isProfessor }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [userQuizResults, setUserQuizResults] = useState({});
    const [quizSubmitting, setQuizSubmitting] = useState(false);
    
    // Form state for creating a new quiz
    const [quizForm, setQuizForm] = useState({
        title: '',
        description: '',
        timeLimit: 30, // in minutes
        startDate: formatDateForInput(new Date()),
        endDate: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Default: 7 days from now
        questions: [{ 
            text: '',
            options: ['', '', '', ''],
            correctOption: 0
        }]
    });
    
    // State for taking a quiz
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentAnswers, setCurrentAnswers] = useState([]);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizResults, setQuizResults] = useState(null);
    const [quizTimeLeft, setQuizTimeLeft] = useState(null);
    const [timeoutId, setTimeoutId] = useState(null);
    
    // Helper function to format date for datetime-local input
    function formatDateForInput(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Check if a quiz is currently available based on start and end dates
    function isQuizAvailable(quiz) {
        const now = new Date();
        const startDate = new Date(quiz.startDate);
        const endDate = new Date(quiz.endDate);
        
        return now >= startDate && now <= endDate;
    }
    
    // Mock data - replace with API calls later
    useEffect(() => {
        // Simulate loading quizzes
        setTimeout(() => {
            // Mock quiz data
            const mockQuizzes = [
                {
                    id: '1',
                    title: 'Midterm Quiz',
                    description: 'Test your understanding of the first half of the course.',
                    createdAt: new Date('2023-10-10'),
                    startDate: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                    endDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                    timeLimit: 30,
                    questions: [
                        {
                            id: '1',
                            text: 'What is the correct answer to this question?',
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            correctOption: 2
                        },
                        {
                            id: '2',
                            text: 'Which of the following is true?',
                            options: ['Statement 1', 'Statement 2', 'Statement 3', 'Statement 4'],
                            correctOption: 1
                        }
                    ]
                },
                {
                    id: '2',
                    title: 'Final Quiz',
                    description: 'Comprehensive test covering all course materials.',
                    createdAt: new Date('2023-11-15'),
                    startDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
                    endDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                    timeLimit: 45,
                    questions: [
                        {
                            id: '1',
                            text: 'Sample question 1?',
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            correctOption: 0
                        },
                        {
                            id: '2',
                            text: 'Sample question 2?',
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            correctOption: 3
                        },
                        {
                            id: '3',
                            text: 'Sample question 3?',
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            correctOption: 1
                        }
                    ]
                }
            ];
            
            // Mock results data - this would come from your API in the future
            const mockResults = {
                '1': { score: 1, total: 2, percentage: 50 }
            };
            
            setQuizzes(mockQuizzes);
            setUserQuizResults(mockResults);
            setLoading(false);
        }, 1000);
    }, [courseId]);
    
    // Handle input changes for the quiz form
    const handleQuizFormChange = (e) => {
        const { name, value } = e.target;
        setQuizForm({ ...quizForm, [name]: value });
    };
    
    // Add a new question to the form
    const addQuestion = () => {
        setQuizForm({
            ...quizForm,
            questions: [...quizForm.questions, { 
                text: '',
                options: ['', '', '', ''],
                correctOption: 0
            }]
        });
    };
    
    // Handle changes to a question
    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...quizForm.questions];
        if (field === 'option') {
            const [optionIndex, optionValue] = value;
            updatedQuestions[index].options[optionIndex] = optionValue;
        } else if (field === 'correctOption') {
            updatedQuestions[index].correctOption = parseInt(value, 10);
        } else {
            updatedQuestions[index][field] = value;
        }
        
        setQuizForm({ ...quizForm, questions: updatedQuestions });
    };
    
    // Remove a question from the form
    const removeQuestion = (index) => {
        const updatedQuestions = [...quizForm.questions];
        updatedQuestions.splice(index, 1);
        setQuizForm({ ...quizForm, questions: updatedQuestions });
    };
    
    // Format a date for display
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    // Handle quiz form submission
    const handleCreateQuiz = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!quizForm.title || !quizForm.description) {
            alert('Please provide a title and description for the quiz.');
            return;
        }
        
        // Validate dates
        const startDate = new Date(quizForm.startDate);
        const endDate = new Date(quizForm.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            alert('Please provide valid start and end dates.');
            return;
        }
        
        if (endDate <= startDate) {
            alert('End date must be after start date.');
            return;
        }
        
        // Check each question
        for (const question of quizForm.questions) {
            if (!question.text) {
                alert('All questions must have text.');
                return;
            }
            
            // Check that all options have text
            if (question.options.some(option => !option)) {
                alert('All options must have text.');
                return;
            }
        }
        
        // Here you would send the data to your backend
        console.log('Quiz data to send:', quizForm);
        
        // For now, just add it to the local state
        const newQuiz = {
            id: Date.now().toString(),
            ...quizForm,
            startDate: new Date(quizForm.startDate),
            endDate: new Date(quizForm.endDate),
            createdAt: new Date()
        };
        
        setQuizzes([...quizzes, newQuiz]);
        setShowCreateForm(false);
        setQuizForm({
            title: '',
            description: '',
            timeLimit: 30,
            startDate: formatDateForInput(new Date()),
            endDate: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
            questions: [{ 
                text: '',
                options: ['', '', '', ''],
                correctOption: 0
            }]
        });
    };
    
    // Start taking a quiz
    const startQuiz = (quiz) => {
        setCurrentQuiz(quiz);
        setCurrentAnswers(new Array(quiz.questions.length).fill(null));
        setQuizCompleted(false);
        setQuizResults(null);
        
        // Set up timer for quiz time limit
        const timeLimit = quiz.timeLimit * 60 * 1000; // Convert minutes to milliseconds
        setQuizTimeLeft(timeLimit);
        
        // Clear any existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Set up new timeout for auto-submission
        const id = setTimeout(() => {
            alert("Time's up! Your quiz will be submitted automatically.");
            submitQuiz();
        }, timeLimit);
        
        setTimeoutId(id);
    };
    
    // Clean up timeout on component unmount or when quiz is closed
    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);
    
    // Handle answer selection
    const handleAnswerSelect = (questionIndex, optionIndex) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[questionIndex] = optionIndex;
        setCurrentAnswers(updatedAnswers);
    };
    
    // Submit a completed quiz
    const submitQuiz = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        
        if (currentAnswers.includes(null)) {
            const confirmSubmit = window.confirm("You haven't answered all questions. Are you sure you want to submit?");
            if (!confirmSubmit) {
                return;
            }
        }
        
        setQuizSubmitting(true);
        
        // Calculate results (normally done on the backend)
        let correctCount = 0;
        currentQuiz.questions.forEach((question, index) => {
            if (currentAnswers[index] === question.correctOption) {
                correctCount++;
            }
        });
        
        const score = correctCount;
        const total = currentQuiz.questions.length;
        const percentage = (score / total) * 100;
        
        // Simulate API call delay
        setTimeout(() => {
            const result = { score, total, percentage };
            setQuizResults(result);
            setQuizCompleted(true);
            
            // Update the results in our local state
            setUserQuizResults({
                ...userQuizResults,
                [currentQuiz.id]: result
            });
            
            setQuizSubmitting(false);
        }, 1000);
    };
    
    // Close the quiz view and return to list
    const closeQuiz = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setCurrentQuiz(null);
        setSelectedQuizId(null);
    };
    
    // Get availability status text
    const getAvailabilityStatus = (quiz) => {
        const now = new Date();
        const startDate = new Date(quiz.startDate);
        const endDate = new Date(quiz.endDate);
        
        if (now < startDate) {
            return `Available from ${formatDate(startDate)}`;
        } else if (now > endDate) {
            return `Closed (ended ${formatDate(endDate)})`;
        } else {
            return `Available until ${formatDate(endDate)}`;
        }
    };
    
    if (loading) {
        return <div className="loading-container">Loading quizzes...</div>;
    }
    
    if (currentQuiz) {
        return (
            <div className="quiz-taking-view">
                <div className="quiz-header">
                    <h2>{currentQuiz.title}</h2>
                    <p className="quiz-description">{currentQuiz.description}</p>
                    <div className="quiz-meta">
                        <span className="time-limit">Time Limit: {currentQuiz.timeLimit} minutes</span>
                        <span className="question-count">Questions: {currentQuiz.questions.length}</span>
                    </div>
                </div>
                
                {!quizCompleted ? (
                    <>
                        <div className="quiz-questions">
                            {currentQuiz.questions.map((question, qIndex) => (
                                <div key={question.id || qIndex} className="quiz-question">
                                    <h3>Question {qIndex + 1}</h3>
                                    <p className="question-text">{question.text}</p>
                                    
                                    <div className="question-options">
                                        {question.options.map((option, oIndex) => (
                                            <div 
                                                key={oIndex} 
                                                className={`question-option ${currentAnswers[qIndex] === oIndex ? 'selected' : ''}`}
                                                onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                            >
                                                <span className="option-indicator">{String.fromCharCode(65 + oIndex)}</span>
                                                <span className="option-text">{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="quiz-actions">
                            <button className="cancel-btn" onClick={closeQuiz}>Cancel</button>
                            <button 
                                className="submit-btn"
                                onClick={submitQuiz}
                                disabled={quizSubmitting}
                            >
                                {quizSubmitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="quiz-results">
                        <h3>Your Results</h3>
                        <div className="results-summary">
                            <div className="result-item">
                                <span className="result-label">Score:</span>
                                <span className="result-value">{quizResults.score} out of {quizResults.total}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Percentage:</span>
                                <span className="result-value">{quizResults.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="result-grade">
                                <span className={`grade ${quizResults.percentage >= 70 ? 'passing' : 'failing'}`}>
                                    {quizResults.percentage >= 90 ? 'Excellent' : 
                                     quizResults.percentage >= 80 ? 'Very Good' :
                                     quizResults.percentage >= 70 ? 'Good' :
                                     quizResults.percentage >= 60 ? 'Satisfactory' : 'Needs Improvement'}
                                </span>
                            </div>
                        </div>
                        
                        <button className="back-to-quizzes" onClick={closeQuiz}>
                            Back to Quizzes
                        </button>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="quizzes-view">
            <div className="quizzes-header">
                <h2>Course Quizzes</h2>
                {isProfessor && (
                    <button 
                        className="create-btn" 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? 'Cancel' : '+ Create Quiz'}
                    </button>
                )}
            </div>
            
            {error && <div className="quizzes-error">{error}</div>}
            
            {/* Professor's view for creating new quiz */}
            {isProfessor && showCreateForm && (
                <div className="quiz-create-form">
                    <h3>Create New Quiz</h3>
                    <form onSubmit={handleCreateQuiz}>
                        <div className="form-group">
                            <label>Quiz Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={quizForm.title} 
                                onChange={handleQuizFormChange} 
                                placeholder="Enter quiz title"
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Description</label>
                            <textarea 
                                name="description" 
                                value={quizForm.description} 
                                onChange={handleQuizFormChange} 
                                placeholder="Enter quiz description"
                                required
                            ></textarea>
                        </div>
                        
                        <div className="form-group">
                            <label>Time Limit (minutes)</label>
                            <input 
                                type="number" 
                                name="timeLimit" 
                                min="1" 
                                max="120"
                                value={quizForm.timeLimit} 
                                onChange={handleQuizFormChange} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Quiz Available From</label>
                            <input 
                                type="datetime-local" 
                                name="startDate" 
                                value={quizForm.startDate} 
                                onChange={handleQuizFormChange} 
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Quiz Available Until</label>
                            <input 
                                type="datetime-local" 
                                name="endDate" 
                                value={quizForm.endDate} 
                                onChange={handleQuizFormChange} 
                                required 
                            />
                        </div>
                        
                        <div className="questions-section">
                            <h4>Questions</h4>
                            
                            {quizForm.questions.map((question, qIndex) => (
                                <div key={qIndex} className="question-form">
                                    <div className="question-header">
                                        <h5>Question {qIndex + 1}</h5>
                                        {quizForm.questions.length > 1 && (
                                            <button 
                                                type="button" 
                                                className="remove-question-btn"
                                                onClick={() => removeQuestion(qIndex)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Question Text</label>
                                        <textarea 
                                            value={question.text} 
                                            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                            placeholder="Enter your question"
                                            required
                                        ></textarea>
                                    </div>
                                    
                                    <div className="options-group">
                                        <label>Answer Options</label>
                                        {question.options.map((option, oIndex) => (
                                            <div key={oIndex} className="option-input-group">
                                                <div className="option-indicator">
                                                    <input 
                                                        type="radio" 
                                                        name={`correctOption-${qIndex}`} 
                                                        checked={question.correctOption === oIndex} 
                                                        onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)} 
                                                    />
                                                    <span>{String.fromCharCode(65 + oIndex)}</span>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={option} 
                                                    onChange={(e) => handleQuestionChange(qIndex, 'option', [oIndex, e.target.value])}
                                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            <button 
                                type="button" 
                                className="add-question-btn"
                                onClick={addQuestion}
                            >
                                + Add Another Question
                            </button>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="create-quiz-btn">Create Quiz</button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* List of quizzes */}
            <div className="quizzes-list">
                {quizzes.length === 0 ? (
                    <div className="no-quizzes">
                        <p>No quizzes available for this course yet.</p>
                    </div>
                ) : (
                    quizzes.map(quiz => {
                        const isAvailable = isQuizAvailable(quiz);
                        const hasCompleted = userQuizResults[quiz.id];
                        const availabilityStatus = getAvailabilityStatus(quiz);
                        
                        return (
                            <div key={quiz.id} className={`quiz-card ${!isAvailable ? 'unavailable' : ''}`}>
                                <div className="quiz-info">
                                    <h3>{quiz.title}</h3>
                                    <p className="quiz-description">{quiz.description}</p>
                                    <div className="quiz-meta-info">
                                        <span className="question-count">{quiz.questions.length} questions</span>
                                        <span className="time-limit">{quiz.timeLimit} minutes</span>
                                        <span className={`availability ${!isAvailable ? 'unavailable' : ''}`}>
                                            {availabilityStatus}
                                        </span>
                                    </div>
                                </div>
                                <div className="quiz-actions">
                                    {isProfessor ? (
                                        <div className="professor-quiz-actions">
                                            <button className="view-results-btn">View Results</button>
                                            <button className="edit-quiz-btn">Edit</button>
                                        </div>
                                    ) : hasCompleted ? (
                                        <div className="student-quiz-result">
                                            <span className="quiz-score">
                                                Score: {userQuizResults[quiz.id].score}/{userQuizResults[quiz.id].total} ({userQuizResults[quiz.id].percentage.toFixed(1)}%)
                                            </span>
                                            {isAvailable && (
                                                <button className="retake-quiz-btn" onClick={() => startQuiz(quiz)}>
                                                    Retake Quiz
                                                </button>
                                            )}
                                        </div>
                                    ) : isAvailable ? (
                                        <button 
                                            className="start-quiz-btn" 
                                            onClick={() => startQuiz(quiz)}
                                        >
                                            Solve Quiz
                                        </button>
                                    ) : (
                                        <button 
                                            className="start-quiz-btn disabled" 
                                            disabled={true}
                                        >
                                            {new Date() < new Date(quiz.startDate) ? 'Not Available Yet' : 'No Longer Available'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuizzesView;