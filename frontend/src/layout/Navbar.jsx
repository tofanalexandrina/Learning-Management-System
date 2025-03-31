import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
                <Link to='/' className='navbar-item'>Home</Link>
                <Link to='/courses' className='navbar-item'>Courses</Link>
                <Link to='/profile' className='navbar-item'>Profile</Link>
            </div>
            <button className='logout-button' onClick={handleLogout}>Log Out</button>
        </div>
    );
};

export default Navbar;