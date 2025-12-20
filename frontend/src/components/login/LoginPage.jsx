import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiBriefcase, FiHome, FiMail, FiLock, FiEye, FiEyeOff, FiEdit3, FiStar, FiCpu } from 'react-icons/fi';
import './LoginPage.css';
import loginImage from '../../assets/login-illustration.png';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const IllustrationSection = () => (
    <div className="auth-illustration">
        <img src={loginImage} alt="A person working on a laptop." className="auth-illustration__image" />
    </div>
);

const userTypes = [
    { name: 'Candidate', icon: <FiUser /> },
    { name: 'Recruiter', icon: <FiBriefcase /> },
    { name: 'Interviewer', icon: <FiHome /> },
    { name: 'Reviewer', icon: <FiEdit3 /> },
];

const inputConfigs = {
    Candidate: { icon: <FiMail />, type: 'email', placeholder: 'Email Address' },
    Recruiter: { icon: <FiMail />, type: 'email', placeholder: 'Email Address' },
    Interviewer: { icon: <FiMail />, type: 'email', placeholder: 'Email Address' },
    Reviewer: { icon: <FiMail />, type: 'email', placeholder: 'Email Address' },
};

function LoginPage() {
    const [activeTab, setActiveTab] = useState('Candidate');
    // New state for the sub-role selection (Technical vs HR)
    const [interviewerSubRole, setInterviewerSubRole] = useState('Technical');

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const currentInputConfig = inputConfigs[activeTab];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        let roleToSend = activeTab;

        if (activeTab === 'Interviewer') {
            if (interviewerSubRole === 'HR') {
                roleToSend = 'HR';
            } else {
                roleToSend = 'Interviewer';
            }
        }

        try {
            const response = await axios.post('http://localhost:5256/api/auth/login', {
                email: email,
                password: password,
                userType: roleToSend
            });
            const token = response.data.data;
            localStorage.setItem('token', token);

            const decodedToken = jwtDecode(token);
            const userRole = decodedToken.role;

            if (userRole === 'Recruiter') {
                navigate('/recruiter-dashboard');
            } else if (userRole === 'Candidate') {
                navigate('/candidate-dashboard');
            } else if (userRole === 'Interviewer') {
                navigate('/interviewer-dashboard');
            } else if (userRole === 'Reviewer') {
                navigate('/reviewer-dashboard');
            } else if (userRole === 'HR') {
                navigate('/hr-dashboard');
            } else {
                navigate('/login');
            }

        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || 'Login failed.');
            } else {
                setError('An unknown error occurred.');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-content">
                <div className="auth-grid">
                    <IllustrationSection />
                    <div className="auth-form">
                        <header className="auth-form__header">
                            <h1>Login</h1>
                            <p>Welcome Back!</p>
                        </header>

                        <div className="auth-tabs">
                            {userTypes.map((type) => (
                                <button
                                    key={type.name}
                                    onClick={() => setActiveTab(type.name)}
                                    className={`auth-tabs__button ${activeTab === type.name ? 'auth-tabs__button--active' : ''}`}
                                >
                                    {type.icon}
                                    <span>{type.name}</span>
                                </button>
                            ))}
                        </div>

                        {activeTab === 'Interviewer' && (
                            <div className="auth-tabs" style={{ marginTop: '-1rem', marginBottom: '1.5rem', backgroundColor: 'transparent', padding: '0' }}>
                                <button
                                    type="button"
                                    onClick={() => setInterviewerSubRole('Technical')}
                                    className={`auth-tabs__button ${interviewerSubRole === 'Technical' ? 'auth-tabs__button--active' : ''}`}
                                    style={{ border: '1px solid #e5e7eb' }} // Ensure border is visible if background is transparent
                                >
                                    <FiCpu />
                                    <span>Technical</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInterviewerSubRole('HR')}
                                    className={`auth-tabs__button ${interviewerSubRole === 'HR' ? 'auth-tabs__button--active' : ''}`}
                                    style={{ border: '1px solid #e5e7eb' }}
                                >
                                    <FiStar />
                                    <span>HR</span>
                                </button>
                            </div>
                        )}

                        <form className="auth-form__body" onSubmit={handleLogin}>
                            <div className="auth-form__field">
                                <span className="auth-form__icon">{currentInputConfig.icon}</span>
                                <input
                                    type={currentInputConfig.type}
                                    placeholder={currentInputConfig.placeholder}
                                    aria-label={currentInputConfig.placeholder}
                                    className="auth-form__input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="auth-form__field">
                                <span className="auth-form__icon"><FiLock /></span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    aria-label="Password"
                                    className="auth-form__input auth-form__input--password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-form__toggle-password" aria-label={showPassword ? "Hide password" : "Show password"}>
                                    {showPassword ? <FiEye /> : <FiEyeOff />}
                                </button>
                            </div>
                            {error && <p className="auth-form__error">{error}</p>}
                            <div className="auth-form__forgot"><a href="#">Forgot Password?</a></div>
                            <button type="submit" className="auth-form__submit">Login</button>
                        </form>
                        <footer className="auth-form__footer">
                            <p>Don't Have an account?{' '}<Link to="/signup">Sign Up</Link></p>
                            <p className="auth-form__version">v25.10.30.1</p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;