import { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import image from '../assets/girl-with-books.png';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try{
        try{
        const studentResponse= await axios.post('http://localhost:5000/api/student/login', {studentEmail: email, password})
            localStorage.setItem('studentId', studentResponse.data.studentId);
            localStorage.setItem('studentFirstName', studentResponse.data.studentFirstName);
            localStorage.setItem('studentLastName', studentResponse.data.studentLastName);
            localStorage.setItem('role', 'student');
            navigate('/');
            return;
        } catch(studentErr){
            console.log('Student login failed, trying professor login');
        }
        
        try{
        const professorResponse= await axios.post('http://localhost:5000/api/professor/login', {professorEmail: email, password})
            localStorage.setItem('professorId', professorResponse.data.professorId);
            localStorage.setItem('firstName', professorResponse.data.professorFirstName);
            localStorage.setItem('lastName', professorResponse.data.professorLastName);
            localStorage.setItem('role', 'professor');
            navigate('/');
            return;
        } catch(professorErr){
            setError('Invalid email or password');}
        }
        catch(error){
            console.log('Login error:', error);
            setError('Invalid email or password');
        }
    }

    return (
        <div className='login-layout'>
            <img src={image} alt='girl-with-books' className="left-image"/>
            <div className='login-container'>
                <div className='title'>Welcome!</div>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className='input-container-login'>
                        <input type='email' placeholder='Email' autoComplete='off' name='email' className='email-input' onChange={(e)=>setEmail(e.target.value)} required/>
                        <input type='password' placeholder='Password' name='password' className='password-input' onChange={(e)=>setPassword(e.target.value)} required/>
                    </div>
                    <button type='submit' className='login-button'>Log In</button>
                    <div className='registration'>
                        <Link to='/register' className='register-link'>Create Account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;