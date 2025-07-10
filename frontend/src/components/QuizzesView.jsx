import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./QuizzesView.css";
import { getGroupName } from '../constants/groups.js';

const QuizzesView = ({ courseId, isProfessor }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [userQuizResults, setUserQuizResults] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  const [viewingResults, setViewingResults] = useState(false);
  const [submissionGroups, setSubmissionGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSubmissions, setGroupSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState(null);

  // Form state for creating a new quiz
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    timeLimit: 30, // in minutes
    startDate: formatDateForInput(new Date()),
    endDate: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Default: 7 days from now
    questions: [
      {
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
      },
    ],
  });

  // State for taking a quiz
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [quizTimeLeft, setQuizTimeLeft] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const intervalRef = useRef(null);

  const studentId = localStorage.getItem("studentId");

  // Helper function to format date for datetime-local input
  function formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Check if a quiz is currently available based on start and end dates
  function isQuizAvailable(quiz) {
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);

    return now >= startDate && now <= endDate;
  }

  // Fetch quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/quiz/course/${courseId}`
        );
        setQuizzes(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  // Fetch student's quiz submissions
  useEffect(() => {
    const fetchStudentSubmissions = async () => {
      if (!isProfessor && quizzes.length > 0 && studentId) {
        try {
          const submissionData = {};

          // Get submission for each quiz
          for (const quiz of quizzes) {
            try {
              const response = await axios.get(
                `http://localhost:5000/api/quiz/student-submission/${quiz.quizId}/${studentId}`
              );
              if (response.data) {
                submissionData[quiz.quizId] = {
                  score: response.data.score,
                  total: response.data.totalQuestions,
                  percentage: response.data.percentage,
                };
              }
            } catch (err) {
              console.error(
                `Error fetching submission for quiz ${quiz.quizId}:`,
                err
              );
            }
          }

          setUserQuizResults(submissionData);
        } catch (err) {
          console.error("Error fetching student submissions:", err);
        }
      }
    };

    fetchStudentSubmissions();
  }, [quizzes, isProfessor, studentId]);

  // Handle input changes for the quiz form
  const handleQuizFormChange = (e) => {
    const { name, value } = e.target;
    setQuizForm({ ...quizForm, [name]: value });
  };

  // Add a new question to the form
  const addQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        {
          text: "",
          options: ["", "", "", ""],
          correctOption: 0,
        },
      ],
    });
  };

  // Handle changes to a question
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizForm.questions];
    if (field === "option") {
      const [optionIndex, optionValue] = value;
      updatedQuestions[index].options[optionIndex] = optionValue;
    } else if (field === "correctOption") {
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
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle quiz form submission
  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    // Validate form
    if (!quizForm.title || !quizForm.description) {
      alert("Please provide a title and description for the quiz.");
      return;
    }

    // Validate dates
    const startDate = new Date(quizForm.startDate);
    const endDate = new Date(quizForm.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert("Please provide valid start and end dates.");
      return;
    }

    if (endDate <= startDate) {
      alert("End date must be after start date.");
      return;
    }

    // Check each question
    for (const question of quizForm.questions) {
      if (!question.text) {
        alert("All questions must have text.");
        return;
      }

      // Check that all options have text
      if (question.options.some((option) => !option)) {
        alert("All options must have text.");
        return;
      }
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/quiz/create",
        {
          title: quizForm.title,
          description: quizForm.description,
          courseId,
          timeLimit: quizForm.timeLimit,
          startDate: quizForm.startDate,
          endDate: quizForm.endDate,
          questions: quizForm.questions,
        }
      );

      // Add the new quiz to state
      setQuizzes([...quizzes, response.data.quiz]);

      // Reset form and close it
      setShowCreateForm(false);
      setQuizForm({
        title: "",
        description: "",
        timeLimit: 30,
        startDate: formatDateForInput(new Date()),
        endDate: formatDateForInput(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ),
        questions: [
          {
            text: "",
            options: ["", "", "", ""],
            correctOption: 0,
          },
        ],
      });

      alert("Quiz created successfully!");
    } catch (err) {
      console.error("Error creating quiz:", err);
      alert("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update the startQuiz function to use a more reliable interval approach
  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentAnswers(new Array(quiz.questions.length).fill(null));
    setQuizCompleted(false);
    setQuizResults(null);

    // Set up timer for quiz time limit
    const timeLimit = quiz.timeLimit * 60 * 1000; // Convert minutes to milliseconds
    setQuizTimeLeft(timeLimit);
    setRemainingTime(timeLimit);

    // Clear any existing timeout and interval
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new timeout for auto-submission
    const id = setTimeout(() => {
      alert("Time's up! Your quiz will be submitted automatically.");
      submitQuiz();
    }, timeLimit);

    setTimeoutId(id);

    // Use a timestamp-based approach for more accurate countdown
    const startTime = Date.now();

    // Create interval to update the countdown every second
    intervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remaining = timeLimit - elapsedTime;

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setRemainingTime(0);
        return;
      }

      setRemainingTime(remaining);
    }, 1000);
  };

  // Make sure the formatTimeRemaining function is defined correctly
  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds === null || milliseconds === undefined) return "00:00";

    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const updatedAnswers = [...currentAnswers];
    updatedAnswers[questionIndex] = optionIndex;
    setCurrentAnswers(updatedAnswers);
  };

  // Submit a completed quiz
  const submitQuiz = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (currentAnswers.includes(null)) {
      const confirmSubmit = window.confirm(
        "You haven't answered all questions. Are you sure you want to submit?"
      );
      if (!confirmSubmit) {
        return;
      }
    }

    setQuizSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/quiz/submit",
        {
          quizId: currentQuiz.quizId,
          studentId,
          answers: currentAnswers,
        }
      );

      const submission = response.data.submission;
      const result = {
        score: submission.score,
        total: submission.totalQuestions,
        percentage: submission.percentage,
      };

      setQuizResults(result);
      setQuizCompleted(true);

      // Update the results in our local state
      setUserQuizResults({
        ...userQuizResults,
        [currentQuiz.quizId]: result,
      });
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Close the quiz view and return to list
  const closeQuiz = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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

  // Delete a quiz (professor only)
  const handleDeleteQuiz = async (quizId) => {
    if (!isProfessor) return;

    if (
      window.confirm(
        "Are you sure you want to delete this quiz? This will also delete all student submissions."
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/quiz/${quizId}`);
        setQuizzes(quizzes.filter((quiz) => quiz.quizId !== quizId));
        alert("Quiz deleted successfully");
      } catch (err) {
        console.error("Error deleting quiz:", err);
        alert("Failed to delete quiz. Please try again.");
      }
    }
  };

  const handleViewResults = async (quizId) => {
    setViewingResults(true);
    setCurrentQuizId(quizId);

    try {
      setLoadingSubmissions(true);
      const response = await axios.get(
        `http://localhost:5000/api/quiz/submissions/groups/${quizId}`
      );
      setSubmissionGroups(response.data);
      setSelectedGroup(null);
      setGroupSubmissions([]);
    } catch (err) {
      console.error("Error fetching submission groups:", err);
      alert("Failed to load submission groups.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleCloseResults = () => {
    setViewingResults(false);
    setCurrentQuizId(null);
    setSubmissionGroups([]);
    setSelectedGroup(null);
    setGroupSubmissions([]);
  };

  const handleSelectGroup = async (groupId) => {
    try {
      setLoadingSubmissions(true);
      const response = await axios.get(
        `http://localhost:5000/api/quiz/submissions/${currentQuizId}/${groupId}`
      );
      setGroupSubmissions(response.data);
      setSelectedGroup(groupId);
    } catch (err) {
      console.error("Error fetching group submissions:", err);
      alert("Failed to load group submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  if (loading && quizzes.length === 0) {
    return <div className="loading-container">Loading quizzes...</div>;
  }

  if (currentQuiz) {
    return (
      <div className="quiz-taking-view">
        <div className="quiz-header">
          <h2>{currentQuiz.title}</h2>
          <p className="quiz-description">{currentQuiz.description}</p>
          <div className="quiz-meta">
            <span className="time-limit">
              Time Limit: {currentQuiz.timeLimit} minutes
            </span>
            <span className="question-count">
              Questions: {currentQuiz.questions.length}
            </span>
            {remainingTime !== null && (
              <span
                className={`time-remaining ${
                  remainingTime < 60000 ? "low" : ""
                }`}
              >
                Time Remaining: {formatTimeRemaining(remainingTime)}
              </span>
            )}
          </div>
        </div>

        {!quizCompleted ? (
          <>
            <div className="quiz-questions">
              {currentQuiz.questions.map((question, qIndex) => (
                <div key={question.questionId} className="quiz-question">
                  <h3>Question {qIndex + 1}</h3>
                  <p className="question-text">{question.text}</p>

                  <div className="question-options">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className={`question-option ${
                          currentAnswers[qIndex] === oIndex ? "selected" : ""
                        }`}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                      >
                        <span className="option-indicator">
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <span className="option-text">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="quiz-actions">
              <button className="cancel-btn" onClick={closeQuiz}>
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={submitQuiz}
                disabled={quizSubmitting}
              >
                {quizSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </>
        ) : (
          <div className="quiz-results">
            <h3>Your Results</h3>
            <div className="results-summary">
              <div className="result-item">
                <span className="result-label">Score:</span>
                <span className="result-value">
                  {quizResults.score} out of {quizResults.total}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Percentage:</span>
                <span className="result-value">
                  {quizResults.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="result-grade">
                <span
                  className={`grade ${
                    quizResults.percentage >= 70 ? "passing" : "failing"
                  }`}
                >
                  {quizResults.percentage >= 90
                    ? "Excellent"
                    : quizResults.percentage >= 80
                    ? "Very Good"
                    : quizResults.percentage >= 70
                    ? "Good"
                    : quizResults.percentage >= 60
                    ? "Satisfactory"
                    : "Needs Improvement"}
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
            {showCreateForm ? "Cancel" : "+ Create Quiz"}
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
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "text", e.target.value)
                      }
                      placeholder="Enter your question"
                      required
                    ></textarea>
                  </div>

                  <div className="options-group">
                    <label>Answer Options</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="option-input-group">
                        <div className="option-indicator-creating">
                          <input
                            type="radio"
                            name={`correctOption-${qIndex}`}
                            checked={question.correctOption === oIndex}
                            onChange={() =>
                              handleQuestionChange(
                                qIndex,
                                "correctOption",
                                oIndex
                              )
                            }
                          />
                          <span>{String.fromCharCode(65 + oIndex)}</span>
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleQuestionChange(qIndex, "option", [
                              oIndex,
                              e.target.value,
                            ])
                          }
                          placeholder={`Option ${String.fromCharCode(
                            65 + oIndex
                          )}`}
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
              <button type="submit" className="create-quiz-btn">
                Create Quiz
              </button>
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
          quizzes.map((quiz) => {
            const isAvailable = isQuizAvailable(quiz);
            const hasCompleted = userQuizResults[quiz.quizId];
            const availabilityStatus = getAvailabilityStatus(quiz);

            return (
              <div
                key={quiz.quizId}
                className={`quiz-card ${!isAvailable ? "unavailable" : ""}`}
              >
                <div className="quiz-info">
                  <h3>{quiz.title}</h3>
                  <p className="quiz-description">{quiz.description}</p>
                  <div className="quiz-meta-info">
                    <span className="question-count">
                      {quiz.questions.length} questions
                    </span>
                    <span className="time-limit">{quiz.timeLimit} minutes</span>
                    <span
                      className={`availability ${
                        !isAvailable ? "unavailable" : ""
                      }`}
                    >
                      {availabilityStatus}
                    </span>
                  </div>
                </div>
                <div className="quiz-actions">
                  {isProfessor ? (
                    <div className="professor-quiz-actions">
                      <button
                        className="view-results-btn"
                        onClick={() => handleViewResults(quiz.quizId)}
                      >
                        View Results
                      </button>
                      <button
                        className="delete-quiz-btn"
                        onClick={() => handleDeleteQuiz(quiz.quizId)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : hasCompleted ? (
                    <div className="student-quiz-result">
                      <span className="quiz-score">
                        Score: {userQuizResults[quiz.quizId].score}/
                        {userQuizResults[quiz.quizId].total} (
                        {userQuizResults[quiz.quizId].percentage.toFixed(1)}%)
                      </span>
                      {isAvailable && (
                        <button
                          className="retake-quiz-btn"
                          onClick={() => startQuiz(quiz)}
                        >
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
                    <button className="start-quiz-btn disabled" disabled={true}>
                      {new Date() < new Date(quiz.startDate)
                        ? "Not Available Yet"
                        : "No Longer Available"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Results view for professors */}
      {isProfessor && viewingResults && (
        <div className="quiz-results-view">
          <div className="results-header">
            <h3>Quiz Results</h3>
            <button className="back-btn" onClick={handleCloseResults}>
              Back to Quizzes
            </button>
          </div>

          {loadingSubmissions ? (
            <div className="loading-submissions">Loading results...</div>
          ) : (
            <div className="results-content">
              {submissionGroups.length === 0 ? (
                <div className="no-submissions">
                  No submissions available for this quiz yet.
                </div>
              ) : (
                <div className="submission-groups">
                  <div className="groups-list">
                    <h4>Groups with Submissions:</h4>
                    <div className="group-buttons">
                      {submissionGroups.map((groupId) => (
                        <button
                          key={groupId}
                          className={`group-btn ${
                            selectedGroup === groupId ? "active" : ""
                          }`}
                          onClick={() => handleSelectGroup(groupId)}
                        >
                          {getGroupName(groupId)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedGroup && (
                    <div className="group-submissions">
                      <h4>Results from {getGroupName(selectedGroup)}:</h4>

                      {groupSubmissions.length === 0 ? (
                        <div className="no-submissions">
                          No results available from this group.
                        </div>
                      ) : (
                        <div className="submissions-list">
                          {groupSubmissions.map((submission) => (
                            <div
                              key={submission.submissionId}
                              className="result-item"
                            >
                              <div className="result-info">
                                <div className="student-name">
                                  <span className="label">Student:</span>
                                  <span className="value">
                                    {submission.studentId.studentFirstName}{" "}
                                    {submission.studentId.studentLastName}
                                  </span>
                                </div>
                                <div className="submission-date">
                                  <span className="label">Submitted:</span>
                                  <span className="value">
                                    {new Date(
                                      submission.submittedAt
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="score-info">
                                  <span className="label">Score:</span>
                                  <span className="value">
                                    {submission.score}/
                                    {submission.totalQuestions} (
                                    {submission.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
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
    </div>
  );
};

export default QuizzesView;
