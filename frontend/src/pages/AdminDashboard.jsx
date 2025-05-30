import React from 'react';
import '../pages/AdminDashboard.css'; 
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleInvite = () => {
    navigate("/admin/register");
  };
  const handleCourseManagement = () => {
    navigate("/admin/courses");
  };

  return (
    <div>
      <button className="invite-btn" onClick={handleInvite}>
        + Invite
      </button>
      <button className="manage-btn" onClick={handleCourseManagement}>
        Manage Courses
      </button>
    </div>
  );
};

export default AdminDashboard;