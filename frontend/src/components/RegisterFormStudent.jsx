import React, { useState } from 'react';
import axios from 'axios';
import './RegisterForm.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RegisterFormStudent = () => {
    const [studentFirstName, setStudentFirstName] = useState('');
    const [studentLastName, setStudentLastName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [password, setPassword] = useState('');
    const [group, setGroup] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/student/register', { studentFirstName, studentLastName, studentEmail, password, group, role: 2 })
            .then(result => {
                console.log(result);
                navigate('/');
            })
            .catch(err => console.log(err));
    }

    return (
        <div className='register-form'>
                <div className='title'>Create account:</div>
                <form onSubmit={handleSubmit}>
                    <div className='input-container'>
                    <input type='text' placeholder='First Name' autoComplete='off' name='first-name' className='first-name-input' onChange={(e) => setStudentFirstName(e.target.value)} />
                        <input type='text' placeholder='Last Name' autoComplete='off' name='last-name' className='last-name-input' onChange={(e) => setStudentLastName(e.target.value)} />
                        <input type='email' placeholder='Email' autoComplete='off' name='email' className='email-input' onChange={(e) => setStudentEmail(e.target.value)} />
                        <input type='password' placeholder='Password' name='password' className='password-input' onChange={(e) => setPassword(e.target.value)} />
                        <input type='text' placeholder='Group (Ex: E-1101)' name='group' className='group-input' onChange={(e) => setGroup(e.target.value)} />
                    </div>
                    <div className='register-btn'>
                        <button type='submit' className='register-button'>Register</button>
                    </div>
                    <div className='login'>
                        <Link to='/login' className='login-link'>Go To Log In</Link>
                    </div>
                </form>
        </div>
    );
}

export default RegisterFormStudent;