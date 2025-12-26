import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Data
    const [role, setRole] = useState('Candidate');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('http://localhost:5256/api/auth/forgot-password', {
                email: email,
                userType: role
            });
            setSuccess(`OTP sent to ${email}`);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Check email or role.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('http://localhost:5256/api/auth/verify-otp', {
                email: email,
                otp: otp
            });
            setSuccess('OTP Verified. Please set a new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or Expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5256/api/auth/reset-password', {
                email: email,
                otp: otp,
                newPassword: newPassword
            });
            setSuccess('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
            setLoading(false);
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                <div className="forgot-header">
                    <h2>Reset Password</h2>
                    <p>Step {step} of 3</p>
                    <div className="step-indicator">
                        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
                    </div>
                </div>

                {error && <div className="error-text">{error}</div>}
                {success && <div className="success-text">{success}</div>}

                {/* STEP 1: Email & Role */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label>I am a...</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="form-control"
                            >
                                <option value="Candidate">Candidate</option>
                                <option value="Recruiter">Recruiter</option>
                                <option value="Interviewer">Interviewer</option>
                                <option value="Reviewer">Reviewer</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-control"
                                placeholder="Enter your registered email"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Get OTP'}
                        </button>
                    </form>
                )}

                {/* STEP 2: OTP Entry */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label>Enter OTP Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="form-control"
                                placeholder="6-digit code"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            className="back-link"
                            onClick={() => setStep(1)}
                            style={{background:'none', border:'none', cursor:'pointer'}}
                        >
                            Wrong email? Go Back
                        </button>
                    </form>
                )}

                {/* STEP 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="form-control"
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-control"
                                placeholder="Re-enter new password"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Change Password'}
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <Link to="/login" className="back-link">
                        <FiArrowLeft style={{marginBottom: '-2px'}}/> Back to Login
                    </Link>
                )}
            </div>
        </div>
    );
}

export default ForgotPasswordPage;