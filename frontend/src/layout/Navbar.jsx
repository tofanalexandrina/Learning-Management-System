import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css'; 

const Navbar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className='navbar'>
            <div className='navbar-items'>
                <NavLink to='/' className={({ isActive }) => 
                    isActive ? 'navbar-item active' : 'navbar-item'
                }>Home</NavLink>
                
                <NavLink to='/courses' className={({ isActive }) => 
                    isActive ? 'navbar-item active' : 'navbar-item'
                }>Courses</NavLink>
                
                <NavLink to='/profile' className={({ isActive }) => 
                    isActive ? 'navbar-item active' : 'navbar-item'
                }>Profile</NavLink>
            </div>
            <button className='logout-button' onClick={handleLogout}>Log Out</button>
        </div>
    );
};

export default Navbar;