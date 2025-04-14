import React, { useState } from 'react';
import axios from 'axios';  
import './RegisterForm.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RegisterFormProfessor = () => {
    const [professorEmail, setProfessorEmail] = useState('');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        
    }


    const groups = [
        { id: '1', name: 'C-1020' },
        { id: '2', name: 'C-1021' },
        { id: '3', name: 'C-1022' },
        { id: '4', name: 'C-1024' },
        { id: '5', name: 'E-1025' },
        { id: '6', name: 'E-1026' },
        { id: '7', name: 'E-1027' },
        { id: '8', name: 'E-1028' },
        { id: '9', name: 'E-1029' },
        {id: '10', name: 'F-1030'}
    ];
    
    const handleGroupChange = (e) => {
        const groupId = e.target.value;
        const isChecked = e.target.checked;
        
        if (isChecked) {
            setSelectedGroups([...selectedGroups, groupId]);
        } else {
            setSelectedGroups(selectedGroups.filter(id => id !== groupId));
        }
    };

    return (
        <div className='register-form'>
                <form onSubmit={handleSubmit}>
                    <div className='input-container'>
                        <input type='email' placeholder='Email' autoComplete='off' name='email' className='email-input' onChange={(e)=>setProfessorEmail(e.target.value)}/>
                        <div className='groups-container'>
                        <label className='groups-label'>Select Group(s):</label>
                        <div className='checkbox-group'>
                            {groups.map(group => (
                                <div key={group.id} className='checkbox-item'>
                                    <input
                                        type='checkbox'
                                        id={`group-${group.id}`}
                                        value={group.id}
                                        checked={selectedGroups.includes(group.id)}
                                        onChange={handleGroupChange}
                                    />
                                    <label htmlFor={`group-${group.id}`}>{group.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    </div>
                    <div className='register-btn'>
                    <button type='submit' className='register-button'>Register</button>
                    </div>
                </form>
        </div>
    );
}

export default RegisterFormProfessor;