import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiBriefcase, FiHome, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiEdit3 } from "react-icons/fi";
import "./SignupPage.css";
import signupImage from "../../assets/login-illustration.png";
import axios from 'axios';

const IllustrationSection = () => (
    <div className="signup-illustration">
        <img src={signupImage} alt="Signup illustration" className="signup-illustration__image" />
    </div>
);

function SignupPage() {
    const [activeTab, setActiveTab] = useState("Interviewer");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState("technical-interviewer");

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const userTypes = [
        { name: "Recruiter", icon: <FiBriefcase /> },
        { name: "Interviewer", icon: <FiHome /> },
        { name: "Reviewer", icon: <FiEdit3 /> },
    ];

    const getInputConfig = () => {
        switch (activeTab) {
            case "Recruiter":
                return {
                    primaryIcon: <FiMail />,
                    primaryType: "email",
                    primaryPlaceholder: "Email Address",
                    showName: true,
                    showRoleDropdown: false,
                };
            case "Interviewer":
                return {
                    primaryIcon: <FiMail />,
                    primaryType: "email",
                    primaryPlaceholder: "Email Address",
                    showName: true,
                    showRoleDropdown: true,
                };
            case "Reviewer":
                return {
                    primaryIcon: <FiMail />,
                    primaryType: "email",
                    primaryPlaceholder: "Email Address",
                    showName: true,
                    showRoleDropdown: false,
                };
            default:
                return {};
        }
    };


    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        let roleToSend;
        if (activeTab === 'Interviewer') {
            roleToSend = (role === 'hr') ? "HR" : "Interviewer";
        } else {
            roleToSend = activeTab;
        }

        try {
            const response = await axios.post('http://localhost:5256/api/auth/register', {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                role: roleToSend
            });

            alert(response.data.message);
            navigate('/login');

        } catch (err) {
        }
    };

    const inputConfig = getInputConfig();

    return (
        <div className="signup-container">
            <div className="signup-content">
                <div className="signup-grid">
                    <IllustrationSection />
                    <div className="signup-form">
                        <div className="signup-form__header">
                            <h1>Create Account</h1>
                            <p>Join us today!</p>
                        </div>

                        <div className="signup-tabs">
                            {userTypes.map((type) => (
                                <button
                                    key={type.name}
                                    onClick={() => setActiveTab(type.name)}
                                    className={`signup-tabs__button ${activeTab === type.name ? "signup-tabs__button--active" : ""}`}
                                >
                                    {type.icon}
                                    <span>{type.name}</span>
                                </button>
                            ))}
                        </div>

                        <form className="signup-form__body" onSubmit={handleSignup}>
                            {inputConfig.showName && (
                                <div className="signup-form__row">
                                    <div className="signup-form__field">
                                        <span className="signup-form__icon"><FiUser /></span>
                                        <input type="text" placeholder="First Name" className="signup-form__input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                    </div>
                                    <div className="signup-form__field">
                                        <span className="signup-form__icon"><FiUser /></span>
                                        <input type="text" placeholder="Last Name" className="signup-form__input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                    </div>
                                </div>
                            )}

                            <div className="signup-form__field">
                                <span className="signup-form__icon">{inputConfig.primaryIcon}</span>
                                <input
                                    type={inputConfig.primaryType}
                                    placeholder={inputConfig.primaryPlaceholder}
                                    className="signup-form__input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {inputConfig.showRoleDropdown && activeTab === 'Interviewer' && (
                                <div className="signup-form__field">
                                    <div className="signup-form__radio-group">
                                        <label className="signup-form__radio-label">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="hr"
                                                checked={role === "hr"}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="signup-form__radio-input"
                                            />
                                            <span className="signup-form__radio-custom"></span>
                                            <span className="signup-form__radio-text">HR</span>
                                        </label>
                                        <label className="signup-form__radio-label">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="technical-interviewer" // Corresponds to Technical role?
                                                checked={role === "technical-interviewer"}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="signup-form__radio-input"
                                            />
                                            <span className="signup-form__radio-custom"></span>
                                            <span className="signup-form__radio-text">Technical Interviewer</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="signup-form__row">
                                <div className="signup-form__field">
                                    <span className="signup-form__icon"><FiLock /></span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="signup-form__input signup-form__input--password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="signup-form__toggle-password">
                                        {showPassword ? <FiEye /> : <FiEyeOff />}
                                    </button>
                                </div>

                                <div className="signup-form__field">
                                    <span className="signup-form__icon"><FiLock /></span>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Pass."
                                        className="signup-form__input signup-form__input--password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="signup-form__toggle-password">
                                        {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                                    </button>
                                </div>
                            </div>

                            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

                            <button type="submit" className="signup-form__submit">
                                Create Account
                            </button>
                        </form>

                        <div className="signup-form__footer">
                            <p>Already have an account? <Link to="/login">Login</Link></p>
                            <p className="signup-form__version">v25.10.29.1</p> {/* Updated version */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;

