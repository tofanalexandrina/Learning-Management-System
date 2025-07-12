import React, { useState } from 'react';
import axios from 'axios';  
import './RegisterForm.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { GROUPS } from '../constants/groups';


const RegisterFormProfessor = () => {
    const [systemEmail, setSystemEmail] = useState('');
    const [personalEmail, setPersonalEmail] = useState('');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        //email validation
        const emailPattern= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!systemEmail || !emailPattern.test(systemEmail)){
            setMessage('Error! Please enter a valid system email address.');
            return;
        }

        if(selectedGroups.length===0){
            setMessage('Error! Please select at least one group!');
            return;
        }
        if (!systemEmail.endsWith('@mentis.com')) {
            setMessage('Error! System email must be ending in @mentis.com.');
            return;
        }

        setLoading(true);
        setMessage('');
        try{
            const temporaryPassword=Math.random().toString(36).slice(-8);
            //sending the registration data to the backend
            const response=axios.post('http://localhost:5000/api/professor/register', {
                professorEmail: systemEmail,
                password: temporaryPassword,
                groups: selectedGroups,
                role: 1,
                professorFirstName: "Pending",
                professorLastName: "Pending"
            });
            setMessage('Professor registered successfully! Now send the invite email!');
        }catch(error){
            console.error('Error registering professor:', error);
            setMessage('Error registering professor. Please try again later.');
        }finally{
            setLoading(false);
        }
        
    }
    
    const handleGroupChange = (e) => {
        const groupId = e.target.value;
        const isChecked = e.target.checked;
        
        if (isChecked) {
            setSelectedGroups([...selectedGroups, groupId]);
        } else {
            setSelectedGroups(selectedGroups.filter(id => id !== groupId));
        }
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();

        //email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!personalEmail || !emailRegex.test(personalEmail)) {
            setMessage('Error! Please enter a valid personal email address.');
            return;
        }

        if (!systemEmail || !emailRegex.test(systemEmail)) {
            setMessage('Error! Please enter a valid system email address.');
            return;
        }

        if (selectedGroups.length === 0) {
            setMessage('Error! Please select at least one group.');
            return;
        }

        if (personalEmail === systemEmail) {
            setMessage('Error! Personal email and system email must be different.');
            return;
        }
        
        setLoading(true);
        setMessage('');

        try{
            // Fix: Use GROUPS instead of undefined 'groups' variable
            const selectedGroupObjects = selectedGroups.map(id => {
                const group = GROUPS.find(g => g.id === id);
                return { id, name: group.name };
            });
            
            const response = await axios.post('http://localhost:5000/api/email/send-professor-invite', {
                personalEmail: personalEmail,
                systemEmail: systemEmail,
                groups: selectedGroupObjects
            });
            
            setMessage('Invitation sent successfully!');
        } catch (error) {
            console.error('Error sending invite:', error);
            setMessage('Error sending invite. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='register-form'>
                <form onSubmit={handleSubmit}>
                    <div className='input-container'>
                        <input type='email' placeholder='Personal Email' autoComplete='off' name='personalemail' className='email-input' onChange={(e)=>setPersonalEmail(e.target.value)}/>
                        <input type='email' placeholder='System Email' autoComplete='off' name='systememail' className='email-input' value={systemEmail} onChange={(e) => setSystemEmail(e.target.value)} />
                        <div className='groups-container'>
                        <label className='groups-label'>Select Group(s):</label>
                        <div className='checkbox-group'>
                            {GROUPS.map(group => (
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
                    {message && <div className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</div>}
                </div>
                <div className='register-btn-group'>
                    <button type='submit' className='register-button'>Register</button>
                    <button type='button' className='invite-button' onClick={handleSendInvite} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Email Invite'}
                    </button>
                    </div>
                </form>
        </div>
    );
}

export default RegisterFormProfessor;