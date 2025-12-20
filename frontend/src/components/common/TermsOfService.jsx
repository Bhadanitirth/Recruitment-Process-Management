import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './StaticPages.css';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="static-page-container">
            <button onClick={() => navigate(-1)} className="static-back-btn">
                <FiArrowLeft /> Back
            </button>

            <div className="static-page-header">
                <h1>Terms of Service</h1>
                <p>Rules and regulations for using ROIMA.</p>
            </div>

            <div className="static-section">
                <h2>1. Agreement to Terms</h2>
                <p>
                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and ROIMA ("we," "us" or "our"),
                    concerning your access to and use of the ROIMA Recruitment Management System.
                </p>
            </div>

            <div className="static-section">
                <h2>2. User Accounts</h2>
                <p>
                    To access certain features of the platform, you must register for an account. You agree to keep your password confidential and will be responsible for all use of your account and password.
                    We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate.
                </p>
            </div>

            <div className="static-section">
                <h2>3. User Representations</h2>
                <p>By using the Site, you represent and warrant that:</p>
                <ul>
                    <li>All registration information you submit will be true, accurate, current, and complete.</li>
                    <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                    <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
                    <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                </ul>
            </div>

            <div className="static-section">
                <h2>4. Prohibited Activities</h2>
                <p>
                    You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                </p>
                <ul>
                    <li>Systematically retrieving data to create a collection, compilation, database, or directory without written permission.</li>
                    <li>Uploading viruses, Trojan horses, or other material that interferes with the use of the Site.</li>
                    <li>Attempting to impersonate another user or person.</li>
                </ul>
            </div>

            <div className="static-section">
                <h2>5. Limitation of Liability</h2>
                <p>
                    In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the site.
                </p>
            </div>

            <div className="static-section">
                <h2>6. Termination</h2>
                <p>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
            </div>

            <p className="last-updated">Last Updated: October 29, 2025</p>
        </div>
    );
};

export default TermsOfService;