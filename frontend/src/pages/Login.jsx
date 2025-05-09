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
        try{
        try{
        const studentResponse= await axios.post('http://localhost:5000/api/student/login', {studentEmail: email, password})
            localStorage.setItem('studentId', studentResponse.data.studentId);
            localStorage.setItem('studentFirstName', studentResponse.data.studentFirstName);
            localStorage.setItem('studentLastName', studentResponse.data.studentLastName);
            localStorage.setItem('role', '2');
            navigate('/');
            return;
        } catch(studentErr){
            console.log('Student login failed, trying professor login');
        }
        
        try{
        const professorResponse= await axios.post('http://localhost:5000/api/professor/login', {professorEmail: email, password})
            localStorage.setItem('professorId', professorResponse.data.professorId);
            localStorage.setItem('professorFirstName', professorResponse.data.professorFirstName);
            localStorage.setItem('professorLastName', professorResponse.data.professorLastName);
            localStorage.setItem('role', '1');
            navigate('/');
            return;
        } catch(professorErr){
            console.log('Professor login failed, trying admin login');
        }

        try{
            const adminResponse= await axios.post('http://localhost:5000/api/admin/login', {adminEmail: email, password})
                localStorage.setItem('adminId', adminResponse.data.adminId);
                localStorage.setItem('role', adminResponse.data.role.toString());
                navigate('/admin');
                return;
            } catch(adminErr) {
                console.log('Invalid admin email or password');
            }
        }
        catch(error){
            console.log('Login error:', error);
            setError('Invalid email or password');
        }
    }

    return (
        <AuthLayout image={image} title="Welcome!">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type='email' placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                    <input type='password' placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type='submit' className='auth-button'>Log In</button>
                </form>
        </AuthLayout>
    );
};

export default Login;