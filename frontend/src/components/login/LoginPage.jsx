import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiBriefcase, FiHome, FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import './LoginPage.css';
import loginImage from '../../assets/login-illustration.png';

// Component for the illustration section for better separation
const IllustrationSection = () => (
    <div className="auth-illustration">
        <img src={loginImage} alt="A person working on a laptop." className="auth-illustration__image" />
    </div>
);

// Configuration for different user types to keep the main component clean
const userTypes = [
    { name: 'Candidate', icon: <FiUser /> },
    { name: 'Recruiter', icon: <FiBriefcase /> },
    { name: 'Interviewer', icon: <FiHome /> },
];

// Configuration for input fields based on user type, using a more declarative object map
const inputConfigs = {
    Candidate: {
        icon: <FiMail />,
        type: 'text',
        placeholder: 'Enrollment No.',
    },
    Recruiter: {
        icon: <FiPhone />,
        type: 'tel',
        placeholder: 'Mobile Number',
    },
    Interviewer: {
        icon: <FiMail />,
        type: 'email',
        placeholder: 'Email Address',
    },
};

function LoginPage() {
    const [activeTab, setActiveTab] = useState('Candidate');
    const [showPassword, setShowPassword] = useState(false);

    const currentInputConfig = inputConfigs[activeTab];

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

                        <form className="auth-form__body">
                            <div className="auth-form__field">
                                <span className="auth-form__icon">{currentInputConfig.icon}</span>
                                <input
                                    type={currentInputConfig.type}
                                    placeholder={currentInputConfig.placeholder}
                                    aria-label={currentInputConfig.placeholder}
                                    className="auth-form__input"
                                />
                            </div>

                            <div className="auth-form__field">
                                <span className="auth-form__icon"><FiLock /></span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    aria-label="Password"
                                    className="auth-form__input auth-form__input--password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="auth-form__toggle-password"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEye /> : <FiEyeOff />}
                                </button>
                            </div>

                            <div className="auth-form__forgot">
                                <a href="#">Forgot Password?</a>
                            </div>

                            <button type="submit" className="auth-form__submit">
                                Login
                            </button>
                        </form>

                        <footer className="auth-form__footer">
                            <p>
                                Don't Have an account?{' '}
                                <Link to="/signup">Sign Up</Link>
                            </p>
                            <p className="auth-form__version">v25.8.26.5</p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;