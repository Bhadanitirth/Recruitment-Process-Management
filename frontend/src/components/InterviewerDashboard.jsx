import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './InterviewerDashboard.css';

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
                    handleLogout();
                }
            } catch (err) {
                setError('Failed to load dashboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div className="interviewer-dashboard-container">Loading...</div>;
    if (error) return <div className="interviewer-dashboard-container error-message">{error}</div>;
    if (!userData) return null;

    return (
        <div className="interviewer-dashboard-container">
            <header className="dashboard-header">
                <h1>Interviewer Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </header>

            <div className="interviewer-info-card">
                <p>Welcome, {userData.firstName}!</p>
            </div>

            <div className="assigned-interviews-section">
                <h2>My Upcoming Interviews</h2>
                {interviews.length > 0 ? (
                    <ul className="interview-list">
                        {interviews.map(interview => (
                            <li key={interview.interviewId}>
                                <Link to={`/interviews/${interview.interviewId}`}>
                                    <strong>{interview.candidateName}</strong> for {interview.jobTitle} ({interview.interviewType})
                                </Link>
                                <div>
                                    <span>{new Date(interview.scheduledAt).toLocaleString()}</span>
                                    <span className={`status-badge status-${interview.status.toLowerCase()}`}>{interview.status}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No interviews assigned.</p>
                )}
            </div>
        </div>
    );
}

export default InterviewerDashboard;

