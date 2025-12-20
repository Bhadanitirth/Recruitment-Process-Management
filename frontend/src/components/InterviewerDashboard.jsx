import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiClock } from 'react-icons/fi';
import './recruiter/RecruiterDashboard.css';
import Sidebar from "./common/Sidebar.jsx";

function InterviewerDashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [profileRes, interviewsRes] = await Promise.all([
                    axios.get('http://localhost:5256/api/profile/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5256/api/interviewer/assigned-interviews', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (profileRes.data?.roleName === 'Interviewer') {
                    setUserData(profileRes.data);
                    setInterviews(interviewsRes.data.data || []);
                } else {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (loading) return <div className="loading-screen">Loading...</div>;
    if (error) return <div className="error-screen">{error}</div>;

    return (
        <div className="dashboard-layout">
            <Sidebar role="Interviewer" activeItem="dashboard" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Technical Interviews</h1>
                        <p>Welcome back, {userData?.firstName}</p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0284c7'}}><FiClock /></div>
                        <div className="stat-info">
                            <h3>{interviews.filter(i => i.status === 'Scheduled').length}</h3>
                            <p>Upcoming Interviews</p>
                        </div>
                    </div>
                </div>

                <div className="content-card full-width">
                    <div className="card-header">
                        <h2>Assigned Technical & Online Tests</h2>
                    </div>
                    <div className="card-body">
                        {interviews.length > 0 ? (
                            <div className="table-container">
                                <table className="dashboard-table">
                                    <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job Title</th>
                                        <th>Type</th>
                                        <th>Scheduled At</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {interviews.map(interview => (
                                        <tr key={interview.interviewId}>
                                            <td>
                                                <div className="job-title">{interview.candidateName}</div>
                                            </td>
                                            <td>{interview.jobTitle}</td>
                                            <td>{interview.interviewType}</td>
                                            <td>{new Date(interview.scheduledAt).toLocaleString()}</td>
                                            <td>
                                                    <span className={`status-pill status-${interview.status.toLowerCase()}`}>
                                                        {interview.status}
                                                    </span>
                                            </td>
                                            <td>
                                                <Link to={`/interviews/${interview.interviewId}`} className="link-text">
                                                    Start Interview
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">No technical interviews assigned.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default InterviewerDashboard;