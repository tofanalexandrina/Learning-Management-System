import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ image, title, children }) => {
  return (
    <div className="auth-page">
      <div className="auth-image-container">
        <img src={image} alt={title} className="auth-image" />
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <h2>{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;