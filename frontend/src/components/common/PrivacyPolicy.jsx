import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './StaticPages.css';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="static-page-container">
            <button onClick={() => navigate(-1)} className="static-back-btn">
                <FiArrowLeft /> Back
            </button>

            <div className="static-page-header">
                <h1>Privacy Policy</h1>
                <p>Your privacy is important to ROIMA Recruitment.</p>
            </div>

            <div className="static-section">
                <h2>1. Introduction</h2>
                <p>
                    Welcome to the ROIMA Recruitment Management System. We are committed to protecting the privacy and security of your personal information.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
            </div>

            <div className="static-section">
                <h2>2. Information We Collect</h2>
                <p>We collect information that you voluntarily provide to us when you register on the platform or express an interest in obtaining information about us or our products and services.</p>
                <ul>
                    <li><strong>Personal Data:</strong> Name, email address, phone number, and physical address.</li>
                    <li><strong>Professional Data:</strong> Resumes/CVs, employment history, educational background, and skills.</li>
                    <li><strong>Documentary Data:</strong> Copies of degrees, certifications, and identification documents uploaded for verification.</li>
                </ul>
            </div>

            <div className="static-section">
                <h2>3. How We Use Your Information</h2>
                <p>We use personal information collected via our platform for a variety of business purposes described below:</p>
                <ul>
                    <li>To facilitate the recruitment process and match candidates with job openings.</li>
                    <li>To schedule and conduct interviews.</li>
                    <li>To communicate with you regarding your application status.</li>
                    <li>To verify your qualifications and background checks (where applicable).</li>
                </ul>
            </div>

            <div className="static-section">
                <h2>4. Data Security</h2>
                <p>
                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.
                    However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                </p>
            </div>

            <div className="static-section">
                <h2>5. Your Rights</h2>
                <p>
                    Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete the data we hold about you.
                </p>
            </div>

            <div className="contact-box">
                <h3>Contact Us</h3>
                <p>If you have questions or comments about this policy, you may email us at privacy@roima.com.</p>
            </div>

            <p className="last-updated">Last Updated: October 29, 2025</p>
        </div>
    );
};

export default PrivacyPolicy;