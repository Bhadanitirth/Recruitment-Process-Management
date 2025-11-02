import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CandidateDashboard.css';
import ProfileDocuments from './ProfileDocuments';

function JobListing() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5256/api/candidate/jobs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setJobs(response.data.data || []);
            } catch (err) {
                console.error("Error fetching jobs:", err); // Log error
                setError('Could not load job listings.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) return <p>Loading jobs...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="job-listing-container">
            <h2>Available Positions</h2>
            {jobs.length > 0 ? jobs.map(job => (
                <div key={job.jobId} className="job-card">
                    <h3>{job.title}</h3>

                    <p>{job.description ? job.description.substring(0, 150) + '...' : 'No description available.'}</p>

                </div>
            )) : <p>No open positions at the moment.</p>}
        </div>
    );
}

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5256/api/candidate/my-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setApplications(response.data.data || []);
            } catch (err) {
                console.error("Error fetching applications:", err);
                setError('Could not load your applications.');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) return <p>Loading your applications...</p>;
    if (error) return <p className="error-message">{error}</p>;

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
            return new Date(dateTimeString).toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="applications-container">
            <h2>My Application Status</h2>
            {applications.length > 0 ? (
                <table className="applications-table">
                    <thead>
                    <tr>
                        <th>Job Title</th>
                        <th>Application Status</th>
                        <th>Applied On</th>
                        <th>Next Step Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {applications.map(app => (
                        <tr key={app.applicationId}>
                            <td>{app.jobTitle}</td>
                            <td><span className={`status-badge status-${app.applicationStatus?.toLowerCase()}`}>{app.applicationStatus}</span></td>
                            <td>{formatDateTime(app.appliedAt)}</td>
                            <td>
                                {app.nextStepType ? (
                                    <div>
                                        <strong>Type:</strong> {app.nextStepType} <br />
                                        <strong>Status:</strong> {app.nextStepStatus || 'N/A'} <br />
                                        <strong>Scheduled:</strong> {formatDateTime(app.nextStepScheduledAt)}
                                    </div>
                                ) : (
                                    "Pending Review"
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : <p>You have not been linked to any jobs yet.</p>}
        </div>
    );
}

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
                {activeTab === 'profile' && <ProfileDocuments />}
            </main>
        </div>
    );
}

export default CandidateDashboard;

