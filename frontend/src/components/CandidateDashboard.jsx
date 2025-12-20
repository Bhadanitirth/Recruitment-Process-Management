import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './CandidateDashboard.css';
import ProfileDocuments from './ProfileDocuments';
import Sidebar from './common/Sidebar';

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
                console.error("Error fetching jobs:", err);
                setError('Could not load job listings.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) return <div className="loading-state">Loading jobs...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="content-card full-width">
            <div className="card-header">
                <h2>Available Positions</h2>
            </div>
            <div className="card-body">
                {jobs.length > 0 ? (
                    <div className="jobs-grid">
                        {jobs.map(job => (
                            <div key={job.jobId} className="job-item-card">
                                <div className="job-item-header">
                                    <h3>{job.title}</h3>
                                    <span className={`status-pill ${job.status.toLowerCase()}`}>{job.status}</span>
                                </div>
                                <p className="job-desc">{job.description ? job.description.substring(0, 150) + '...' : 'No description available.'}</p>
                              </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">No open positions at the moment.</div>
                )}
            </div>
        </div>
    );
}

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);

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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (loading) return <div className="loading-state">Loading your applications...</div>;
    if (error) return <div className="error-message">{error}</div>;

    if (selectedApp) {

        const activeInterview = selectedApp.interviewHistory?.find(i => i.status === 'Scheduled');

        return (
            <div className="content-card full-width">
                <div className="card-header" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <button
                        onClick={() => setSelectedApp(null)}
                        className="btn-action outline small"
                        style={{marginRight: '10px'}}
                    >
                        ← Back
                    </button>
                    <h2>{selectedApp.jobTitle}</h2>
                </div>
                <div className="card-body">

                    <div style={{marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb'}}>
                        <h3 style={{marginBottom: '0.5rem', color: '#374151'}}>Current Status</h3>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <span className={`status-pill status-${selectedApp.applicationStatus?.toLowerCase().replace(' ', '-')}`} style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>
                                {selectedApp.applicationStatus}
                            </span>
                            {selectedApp.applicationStatus === 'Hired' && selectedApp.joiningDate && (
                                <div className="joining-date-info" style={{fontSize: '1rem'}}>
                                    🎉 Joining Date: <strong>{formatDate(selectedApp.joiningDate)}</strong>
                                </div>
                            )}
                        </div>
                    </div>

                    {activeInterview && (
                        <div style={{marginBottom: '2rem', backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #bbf7d0'}}>
                            <h3 style={{marginTop: 0, color: '#166534'}}>📅 Upcoming Interview</h3>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
                                <div>
                                    <label style={{display:'block', color:'#6b7280', fontSize:'0.85rem'}}>Round</label>
                                    <strong style={{color:'#1f2937'}}>Round {activeInterview.roundNumber}</strong>
                                </div>
                                <div>
                                    <label style={{display:'block', color:'#6b7280', fontSize:'0.85rem'}}>Type</label>
                                    <strong style={{color:'#1f2937'}}>{activeInterview.interviewType}</strong>
                                </div>
                                <div>
                                    <label style={{display:'block', color:'#6b7280', fontSize:'0.85rem'}}>Date & Time</label>
                                    <strong style={{color:'#1f2937'}}>{formatDateTime(activeInterview.scheduledAt)}</strong>
                                </div>
                            </div>
                            {activeInterview.meetingLink && (
                                <div style={{marginTop: '1.5rem'}}>
                                    <a
                                        href={activeInterview.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="join-meeting-btn"
                                        style={{fontSize: '1rem', padding: '0.75rem 1.5rem'}}
                                    >
                                        Join Online Meeting 🎥
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {(selectedApp.applicationStatus === 'Offered' || selectedApp.applicationStatus === 'Hired' || selectedApp.applicationStatus === 'Shortlisted') && (
                        <div style={{marginBottom: '2rem'}}>
                            <h3 style={{color: '#374151'}}>Documents</h3>
                            <p style={{color: '#6b7280', marginBottom: '1rem'}}>Manage your CV, documents, and offer letter.</p>
                            <Link to={`/applications/${selectedApp.applicationId}/documents`} className="btn-action primary">
                                Go to Document Portal
                            </Link>
                        </div>
                    )}

                    <div>
                        <h3 style={{color: '#374151', marginBottom: '1rem'}}>Interview History</h3>
                        {selectedApp.interviewHistory && selectedApp.interviewHistory.length > 0 ? (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                                {selectedApp.interviewHistory.map((round, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '0.5rem',
                                        borderLeft: round.status === 'Completed' ? '4px solid #10b981' : round.status === 'Scheduled' ? '4px solid #3b82f6' : '4px solid #e5e7eb'
                                    }}>
                                        <div>
                                            <div style={{fontWeight: 600, color: '#374151'}}>Round {round.roundNumber}: {round.interviewType}</div>
                                            <div style={{fontSize: '0.85rem', color: '#6b7280'}}>{formatDateTime(round.scheduledAt)}</div>
                                        </div>
                                        <div>
                                            <span className={`status-text ${round.status.toLowerCase()}`}>{round.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{color: '#6b7280', fontStyle: 'italic'}}>No interview history yet.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-card full-width">
            <div className="card-header">
                <h2>My Applications</h2>
            </div>
            <div className="card-body">
                {applications.length > 0 ? (
                    <div className="table-container">
                        <table className="dashboard-table">
                            <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Status</th>
                                <th>Applied On</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {applications.map(app => (
                                <tr key={app.applicationId}>
                                    <td><div className="job-title">{app.jobTitle}</div></td>
                                    <td><span className={`status-pill status-${app.applicationStatus?.toLowerCase().replace(' ', '-')}`}>{app.applicationStatus}</span></td>
                                    <td>{formatDate(app.appliedAt)}</td>
                                    <td>
                                        <button
                                            onClick={() => setSelectedApp(app)}
                                            className="btn-action outline small"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">You have not been linked to any jobs yet.</div>
                )}
            </div>
        </div>
    );
}

function CandidateDashboard() {
    const [activeTab, setActiveTab] = useState('jobs');
    const navigate = useNavigate();

    const titles = {
        'jobs': 'Job Listings',
        'applications': 'My Applications',
        'profile': 'Profile & Documents'
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                role="Candidate"
                activeItem={activeTab}
                onTabChange={setActiveTab}
            />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>{titles[activeTab]}</h1>
                        <p>Welcome back, Candidate</p>
                    </div>
                </header>

                <div className="content-grid single-col">
                    {activeTab === 'jobs' && <JobListing />}
                    {activeTab === 'applications' && <MyApplications />}
                    {activeTab === 'profile' && <div className="content-card"><div className="card-body"><ProfileDocuments /></div></div>}
                </div>
            </main>
        </div>
    );
}

export default CandidateDashboard;