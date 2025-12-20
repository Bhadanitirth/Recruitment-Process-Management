import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiBriefcase, FiGrid, FiCheckCircle } from 'react-icons/fi';
import './recruiter/RecruiterDashboard.css';
import Sidebar from "./common/Sidebar.jsx";

function HRDashboard() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [hrInterviews, setHrInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const dashboardRes = await axios.get('http://localhost:5256/api/hr/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const interviewsRes = await axios.get('http://localhost:5256/api/interviewer/assigned-interviews', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setApplications(dashboardRes.data.data || []);
                setHrInterviews(interviewsRes.data.data || []);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) return <div className="loading-screen">Loading HR Dashboard...</div>;
    if (error) return <div className="error-screen">{error}</div>;

    const actionRequiredApps = applications.filter(app => app.status === 'Shortlisted');
    const finalStageApps = applications.filter(app => ['Offered', 'Hired', 'On-Hold', 'Interview'].includes(app.status));

    return (
        <div className="dashboard-layout">
            <Sidebar role="HR" activeItem="dashboard" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>HR Overview</h1>
                        <p>Manage interviews, documents, and final selections</p>
                    </div>
                </header>

                <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>

                    <div className="content-card">
                        <div className="card-header">
                            <h2>My HR Interviews</h2>
                            <span className="badge">{hrInterviews.filter(i => i.status === 'Scheduled').length} Scheduled</span>
                        </div>
                        <div className="card-body">
                            {hrInterviews.length > 0 ? (
                                <div className="table-container">
                                    <table className="dashboard-table">
                                        <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Job</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {hrInterviews.map(interview => (
                                            <tr key={interview.interviewId}>
                                                <td><div className="job-title">{interview.candidateName}</div></td>
                                                <td>{interview.jobTitle}</td>
                                                <td>{new Date(interview.scheduledAt).toLocaleString()}</td>
                                                <td><span className={`status-pill status-${interview.status.toLowerCase()}`}>{interview.status}</span></td>
                                                <td>
                                                    <Link to={`/interviews/${interview.interviewId}`} className="link-text">
                                                        Conduct Interview
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">No HR interviews assigned to you.</div>
                            )}
                        </div>
                    </div>

                    <div className="content-card">
                        <div className="card-header">
                            <h2>Final Stage & Document Verification</h2>
                        </div>
                        <div className="card-body">
                            {finalStageApps.length > 0 ? (
                                <div className="table-container">
                                    <table className="dashboard-table">
                                        <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Job</th>
                                            <th>Current Status</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {finalStageApps.map(app => (
                                            <tr key={app.applicationId}>
                                                <td><div className="job-title">{app.candidateName}</div></td>
                                                <td>{app.jobTitle}</td>
                                                <td><span className={`status-pill status-${app.status.toLowerCase().replace(' ', '-')}`}>{app.status}</span></td>
                                                <td>
                                                    <Link to={`/applications/${app.applicationId}/documents`} className="link-text">
                                                        Manage Documents/Offer
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">No candidates in final stages.</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HRDashboard;