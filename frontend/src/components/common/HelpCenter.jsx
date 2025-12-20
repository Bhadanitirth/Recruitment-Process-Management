import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './StaticPages.css';

const HelpCenter = () => {
    const navigate = useNavigate();

    return (
        <div className="static-page-container">
            <button onClick={() => navigate(-1)} className="static-back-btn">
                <FiArrowLeft /> Back
            </button>

            <div className="static-page-header">
                <h1>Help Center</h1>
                <p>Frequently Asked Questions & Support</p>
            </div>

            <div className="static-section">
                <h2>Frequently Asked Questions</h2>

                <div className="faq-item">
                    <h3>How do I reset my password?</h3>
                    <p>Currently, password resets must be handled by an administrator. Please contact support via email to request a password reset link.</p>
                </div>

                <div className="faq-item">
                    <h3>I am a candidate. How do I track my application?</h3>
                    <p>Log in to your Candidate Dashboard. Navigate to the "My Applications" tab on the sidebar. You will see a list of all jobs you have applied for and their current status (e.g., Applied, Interview Scheduled, Offer Received).</p>
                </div>

                <div className="faq-item">
                    <h3>What file formats are supported for CVs?</h3>
                    <p>We support PDF, DOC, and DOCX formats. Please ensure your file size is under 5MB for optimal performance.</p>
                </div>

                <div className="faq-item">
                    <h3>How do I join a scheduled interview?</h3>
                    <p>If your interview is online, a "Join Meeting" link will appear in your dashboard next to the scheduled interview time. You will also receive an email notification with the link.</p>
                </div>

                <div className="faq-item">
                    <h3>I am an Interviewer. How do I submit feedback?</h3>
                    <p>Go to your Interviewer Dashboard, find the scheduled interview, click "Start Interview," and you will be taken to the details page where you can fill out the evaluation form and submit your recommendation.</p>
                </div>
            </div>

            <div className="contact-box">
                <h3>Still need help?</h3>
                <p>Our support team is available Monday to Friday, 9 AM - 6 PM EST.</p>
                <p><strong>Email:</strong> support@roima.com</p>
                <p><strong>Phone:</strong> +91 7801977543</p>
            </div>
        </div>
    );
};

export default HelpCenter;