import { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import image from '../assets/girl-with-books.png';
import './Login.css';
import AuthLayout from "../layout/AuthLayout";
import './AuthForms.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Initial validation remains the same
        if(!email){
            setError('Please enter your email address');
            return;
        }

        if(!password){
            setError('Please enter your password');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailPattern.test(email)){
            setError('Please enter a valid email address');
            return;
        }

        try {
            // Track the responses to determine error type
            let invalidPassword = false;
            
            // Try student login
            try {
                const studentResponse = await axios.post('http://localhost:5000/api/student/login', 
                    {studentEmail: email, password}
                );
                
                // If successful, set storage and navigate
                localStorage.setItem('studentId', studentResponse.data.studentId);
                localStorage.setItem('studentFirstName', studentResponse.data.studentFirstName);
                localStorage.setItem('studentLastName', studentResponse.data.lastName);
                localStorage.setItem('studentEmail', email);
                localStorage.setItem('studentGroup', studentResponse.data.group);
                localStorage.setItem('role', '2');            
                navigate('/');
                return;
            } catch(studentErr) {
                console.log('Student login attempt:', studentErr);
                // Check if it's an invalid password error
                if (studentErr.response?.status === 400) {
                    invalidPassword = true;
                }
            }
            
            // Only try professor login if not an invalid password
            if (!invalidPassword) {
                try {
                    const professorResponse = await axios.post('http://localhost:5000/api/professor/login', 
                        {professorEmail: email, password}
                    );
                    
                    localStorage.setItem('professorId', professorResponse.data.id);
                    localStorage.setItem('professorFirstName', professorResponse.data.professorFirstName);
                    localStorage.setItem('professorLastName', professorResponse.data.professorLastName);
                    localStorage.setItem('professorEmail', professorResponse.data.professorEmail);
                    localStorage.setItem('professorGroups', JSON.stringify(professorResponse.data.groups));
                    localStorage.setItem('role', '1');
                    navigate('/');
                    return;
                } catch(professorErr) {
                    console.log('Professor login attempt:', professorErr);
                    if (professorErr.response?.status === 400) {
                        invalidPassword = true;
                    }
                }
            }
            
            // Only try admin login if not an invalid password
            if (!invalidPassword) {
                try {
                    const adminResponse = await axios.post('http://localhost:5000/api/admin/login', 
                        {adminEmail: email, password}
                    );
                    
                    localStorage.setItem('adminId', adminResponse.data.adminId);
                    localStorage.setItem('role', adminResponse.data.role.toString());
                    navigate('/admin');
                    return;
                } catch(adminErr) {
                    console.log('Admin login attempt:', adminErr);
                }
            }
            
            // If we get here, no successful login
            if (invalidPassword) {
                setError('Incorrect password. Please try again.');
            } else {
                setError('No account found with this email address.');
            }
        } catch(error) {
            console.error('Login error:', error);
            setError(error.response?.data?.error || 'An error occurred during login. Please try again.');
        }
    }

    return (
        <AuthLayout image={image} title="Welcome!">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type='email' placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                    <input type='password' placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                </div>
                {error && <div className="login-error">{error}</div>}
                <button type='submit' className='auth-button'>Log In</button>
                </form>
        </AuthLayout>
    );
};

export default Login;