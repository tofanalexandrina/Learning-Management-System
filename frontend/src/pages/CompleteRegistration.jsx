import React, {useState, useEffect} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import image from '../assets/girl-with-books.png';
import AuthLayout from '../layout/AuthLayout';
import './AuthForms.css';

const CompleteRegistration = () => {
    const [searchParams] = useSearchParams();
    const navigate=useNavigate();

    const [formData, setFormData]=useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const token=searchParams.get('token');
    const role=searchParams.get('role');
    const email=searchParams.get('email');
    const group=searchParams.get('group');
    const groups=searchParams.get('groups')?JSON.parse(decodeURIComponent(searchParams.get('groups'))):null;


    useEffect(() => {
        if(email){
            setFormData(prev=>({...prev, email}));
        }

        if (!token || !role || !email) {
            setError('Invalid registration link. Please contact administrator.');
        }
    }, [token, role, email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        //required fields validation
        if (!formData.firstName.trim()) {
            setError('First name is required');
            return;
        }

        if(!formData.lastName.trim()){
            setError('Last name is required');
            return;
        }

        //name format validation - no numbers
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
        if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
            setError('Names should only contain letters, spaces and hyphens');
            return;
        }

        //password validation
        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters long');
            return;
        }

        //for more complex password
        //  if (!/[A-Z]/.test(formData.password)) {
        //    setError("Password must contain at least one uppercase letter");
        //    return;
        //  }

        //  if (!/[0-9]/.test(formData.password)) {
        //    setError("Password must contain at least one number");
        //    return;
        //  }

        if(formData.password!==formData.confirmPassword){
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try{
            let response;
            if(role==='1'){
                //registering professor
                response=await axios.post('http://localhost:5000/api/professor/complete-registration', {
                    professorFirstName: formData.firstName,
                    professorLastName: formData.lastName,
                    professorEmail: formData.email,
                    password: formData.password,
                    groups: groups?.map(g => g.id),
                    token: token
                });
            }else if(role==='2'){
                //registering student
                response = await axios.post('http://localhost:5000/api/student/complete-registration', {
                    studentFirstName: formData.firstName,
                    studentLastName: formData.lastName,
                    studentEmail: formData.email,
                    password: formData.password,
                    group: group,
                    token: token
                });
            }
            setSuccess(true);

            //redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }catch(err){
            setError('Error completing registration. Please try again.');
            console.error('Registration error:', err);
        }finally{
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout image={image} title="Registration Complete!">
                <div className="success-message">
                    <p>Your account has been successfully created.</p>
                    <p>You will be redirected to the login page shortly...</p>
                </div>
            </AuthLayout>
        );
    }

    return(
        <AuthLayout image={image} title="Complete Your Registration">
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required/>
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required/>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} disabled/>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required/>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required/>
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
        </form>
        </AuthLayout>

    );
};
export default CompleteRegistration;