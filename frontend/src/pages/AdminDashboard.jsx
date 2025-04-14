import React from 'react';
import '../pages/AdminDashboard.css'; 
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleInvite = () => {
        navigate('/admin/register');
    };
    
    return (
        <div>
            <button className='invite-btn' onClick={handleInvite}>+ Invite</button>
        </div>
    );
};

export default AdminDashboard;