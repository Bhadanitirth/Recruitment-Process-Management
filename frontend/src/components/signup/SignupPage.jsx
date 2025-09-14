import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiBriefcase, FiHome, FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from "react-icons/fi";
import "./SignupPage.css";

import signupImage from "../../assets/login-illustration.png";

const IllustrationSection = () => (
    <div className="signup-illustration">
        <img src={signupImage} alt="Signup illustration" className="signup-illustration__image" />
    </div>
);

function SignupPage() {
    const [activeTab, setActiveTab] = useState("Interviewer")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [role, setRole] = useState("")

    const userTypes = [
        { name: "Recruiter", icon: <FiBriefcase /> },
        { name: "Interviewer", icon: <FiHome /> },
    ]

    const getInputConfig = () => {
        switch (activeTab) {
            case "Recruiter":
                return {
                    primaryIcon: <FiPhone />,
                    primaryType: "tel",
                    primaryPlaceholder: "Mobile Number",
                    showName: true,
                    showRoleDropdown: false,
                }
            case "Interviewer":
                return {
                    primaryIcon: <FiMail />,
                    primaryType: "email",
                    primaryPlaceholder: "Email Address",
                    showName: true,
                    showRoleDropdown: true,
                }
            default:
                return {
                    primaryIcon: <FiMail />,
                    primaryType: "text",
                    primaryPlaceholder: "Enrollment No.",
                    showName: false,
                    showRoleDropdown: false,
                }
        }
    }

    const inputConfig = getInputConfig()

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

                        <form className="signup-form__body">
                            {inputConfig.showName && (
                                <div className="signup-form__row">
                                    <div className="signup-form__field">
                    <span className="signup-form__icon">
                      <FiUser />
                    </span>
                                        <input type="text" placeholder="First Name" className="signup-form__input" />
                                    </div>
                                    <div className="signup-form__field">
                    <span className="signup-form__icon">
                      <FiUser />
                    </span>
                                        <input type="text" placeholder="Last Name" className="signup-form__input" />
                                    </div>
                                </div>
                            )}

                            <div className="signup-form__field">
                                <span className="signup-form__icon">{inputConfig.primaryIcon}</span>
                                <input
                                    type={inputConfig.primaryType}
                                    placeholder={inputConfig.primaryPlaceholder}
                                    className="signup-form__input"
                                />
                            </div>

                            {inputConfig.showRoleDropdown && (
                                <div className="signup-form__field">
                                    <div className="signup-form__radio-group">
                                        <label className="signup-form__radio-label">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="hr-manager"
                                                checked={role === "hr-manager"}
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
                                                value="technical-interviewer"
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
                  <span className="signup-form__icon">
                    <FiLock />
                  </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="signup-form__input signup-form__input--password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="signup-form__toggle-password"
                                    >
                                        {showPassword ? <FiEye /> : <FiEyeOff />}
                                    </button>
                                </div>

                                <div className="signup-form__field">
                  <span className="signup-form__icon">
                    <FiLock />
                  </span>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Pass."
                                        className="signup-form__input signup-form__input--password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="signup-form__toggle-password"
                                    >
                                        {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="signup-form__submit">
                                Create Account
                            </button>
                        </form>

                        <div className="signup-form__footer">
                            <p>
                                Already have an account? <a href="/login">Login</a>
                            </p>
                            <p className="signup-form__version">v25.8.26.5</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
