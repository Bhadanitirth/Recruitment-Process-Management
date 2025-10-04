import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidateDashboard.css';
import JobListing from './JobListing';
import MyApplications from './MyApplications';
import ProfileDocuments from './ProfileDocuments'; // Import the new component

function CandidateDashboard() {
    const [activeTab, setActiveTab] = useState('jobs');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="candidate-dashboard">
            <header className="candidate-header">
                <h1>My Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </header>

            <nav className="candidate-nav">
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={activeTab === 'jobs' ? 'active' : ''}
                >
                    Job Listings
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={activeTab === 'applications' ? 'active' : ''}
                >
                    My Applications
                </button>
                {/* --- ADD THIS NEW TAB --- */}
                <button
                    onClick={() => setActiveTab('profile')}
                    className={activeTab === 'profile' ? 'active' : ''}
                >
                    Profile & Documents
                </button>
            </nav>

            <main className="candidate-content">
                {activeTab === 'jobs' && <JobListing />}
                {activeTab === 'applications' && <MyApplications />}
                {/* --- RENDER THE NEW COMPONENT --- */}
                {activeTab === 'profile' && <ProfileDocuments />}
            </main>
        </div>
    );
}

export default CandidateDashboard;

