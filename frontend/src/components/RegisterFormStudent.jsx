import React, { useState } from 'react';
import axios from 'axios';
import './RegisterForm.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RegisterFormStudent = () => {
    const [studentEmail, setStudentEmail] = useState('');
    const [group, setGroup] = useState('');

    const handleSubmit = (e) => {
        
    }

    return (
        <div className='register-form'>
                <form onSubmit={handleSubmit}>
                    <div className='input-container'>
                        <input type='email' placeholder='Email' autoComplete='off' name='email' className='email-input' onChange={(e) => setStudentEmail(e.target.value)} />
                        <select className='group-input' onChange={(e) => setGroup(e.target.value)}>
                            <option value=''>Group</option>
                            <option value='1'>C-1020</option>
                            <option value='2'>C-1021</option>
                            <option value='3'>C-1022</option>
                            <option value='4'>C-1024</option>
                            <option value='5'>E-1025</option>
                            <option value='6'>E-1026</option>
                            <option value='7'>E-1027</option>
                            <option value='8'>E-1028</option>
                            <option value='9'>E-1029</option>
                        </select>
                    </div>
                    <div className='register-btn'>
                        <button type='submit' className='register-button'>Register</button>
                    </div>
                </form>
        </div>
    );
}

export default RegisterFormStudent;