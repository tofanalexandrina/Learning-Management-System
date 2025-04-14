import { React, useState } from "react";
import "./RegisterForAdmin.css";
import RegisterFormStudent from "../components/RegisterFormStudent";
import RegisterFormProfessor from "../components/RegisterFormProfessor";
import { useNavigate } from "react-router-dom";

const RegisterForAdmin = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  
  const handleButtonClick = (role) => {
    setRole(role);
  };
  
  const handleBack = () => {
    if (role === null) {
      navigate("/admin");
    } else {
      setRole(null);
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <div className="admin-content">
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
        
        <div className="admin-card">
          {role === null && (
            <div className="role-selection">
              <h2 className="section-title">Register New User</h2>
              <div className="admin-buttons">
                <button
                  className="admin-btn"
                  onClick={() => handleButtonClick("student")}
                >
                  Register Student
                </button>
                <button
                  className="admin-btn secondary"
                  onClick={() => handleButtonClick("profesor")}
                >
                  Register Professor
                </button>
              </div>
            </div>
          )}

          {role === "student" && (
            <div className="form-container">
              <h2 className="section-title">Register Student</h2>
              <RegisterFormStudent />
            </div>
          )}
          
          {role === "profesor" && (
            <div className="form-container">
              <h2 className="section-title">Register Professor</h2>
              <RegisterFormProfessor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForAdmin;
