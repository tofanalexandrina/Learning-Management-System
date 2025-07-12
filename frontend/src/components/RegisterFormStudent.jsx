import React, { useState } from 'react';
import axios from 'axios';
import './RegisterForm.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { GROUPS } from '../constants/groups';


const RegisterFormStudent = () => {
    const [systemEmail, setSystemEmail] = useState('');
    const [personalEmail, setPersonalEmail] = useState('');
    const [group, setGroup] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    const handleSubmit = (e) => {
        e.preventDefault();

        //email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!systemEmail || !emailPattern.test(systemEmail)){
            setMessage('Error! Please enter a valid system email address.');
            return;
        }

        //validation for system email
        if(!systemEmail.endsWith('@mentis.com')){
            setMessage('Error! System email must be ending in @mentis.com.');
            return;
        }
        
        if (!group) {
        setMessage('Error! Please select a group.');
        return;
        }
        
        setLoading(true);
        setMessage('');

        try{
            const temporaryPassword=Math.random().toString(36).slice(-8);
            //sending the registration data to the backend
            const response=axios.post('http://localhost:5000/api/student/register', {
                studentEmail: systemEmail,
                password: temporaryPassword,
                group: group,
                role: 2,
                studentFirstName: "Pending",
                studentLastName: "Pending"
            });
            setMessage('Student registered successfully! Now send the invite email!');
        }catch (error) {
            console.error('Error registering student:', error);
            setMessage('Error registering student. Please try again later.');
        }finally {
            setLoading(false);
        }
    }

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if(!systemEmail || !personalEmail || !group){
            setMessage('Error! All fields are required!');
            return;
        }
        setLoading(true);
        setMessage('');

        //validation for email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!personalEmail || !emailPattern.test(personalEmail)){
            setMessage('Error! Please enter a valid personal email address.');
            return;
        }
        if(!systemEmail||!emailPattern.test(systemEmail)){
            setMessage('Error! Please enter a valid system email address.');
            return;
        }
        if(!group){
            setMessage('Error! Please select a group.');
            return;
        }
        if(personaEmail===systemEmail){
            setMessage('Error! Personal email and system email must be different.');
            return;
        }



        try {
            //getting group name
            const selectedGroup=document.querySelector('.group-input').options[document.querySelector('.group-input').selectedIndex].text;
            //sending the invite to the backend
            const response=await axios.post('http://localhost:5000/api/email/send-student-invite', {
                personalEmail: personalEmail,
                systemEmail: systemEmail,
                group: selectedGroup
            });
            setMessage('Invitation sent successfully!');
        }catch (error) {
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
                        <input type='email' placeholder='Personal Email' autoComplete='off' name='personalemail' className='email-input' value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} />
                        <input type='email' placeholder='System Email' autoComplete='off' name='systememail' className='email-input' value={systemEmail} onChange={(e) => setSystemEmail(e.target.value)} />
                        <select className='group-input' onChange={(e) => setGroup(e.target.value)}>
                            <option value=''>Group</option>
                            {GROUPS.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                        </select>
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

export default RegisterFormStudent;