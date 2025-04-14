import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };
    
    return (
        <div className="admin-layout">
        <div className="admin-header">
            <h1 className="admin-title">Mentis Admin Dashboard</h1>
            <button className="logout-btn" onClick={handleLogout}>
            Log Out
            </button>
        </div>
    
        <div className="admin-content">
            <Outlet />
        </div>
        </div>
    );
}

export default AdminLayout;