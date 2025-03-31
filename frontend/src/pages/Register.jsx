import { React, useState } from "react";
import "./Register.css";
import image from "../assets/girl-with-books.png";
import RegisterFormStudent from "../components/RegisterFormStudent";
import RegisterFormProfessor from "../components/RegisterFormProfessor";

const Register = () => {
  const [role, setRole] = useState(null);

  const handleButtonClick = (role) => {
    setRole(role);
  };

  return (
    <div className="register-layout">
      <img src={image} alt="girl-with-books" className="left-image" />
      <div className="register-container">
        <div className="register-box">
          {/* ChooseRole component */}

          {role === null && (
            <div>
              <div className="title">Select your role:</div>
              <div className="button-container">
                <button
                  className="button"
                  onClick={() => {
                    handleButtonClick("student");
                  }}
                >
                  Student
                </button>
                <button
                  className="button"
                  onClick={() => {
                    handleButtonClick("profesor");
                  }}
                >
                  Professor
                </button>
              </div>
            </div>
          )}

          {/* Register Person Component */}
          {role === "student" && (
            <div>
              <RegisterFormStudent />
            </div>
          )}
          {role === "profesor" && (
            <div>
              <RegisterFormProfessor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
