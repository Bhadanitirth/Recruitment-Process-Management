import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiClock, FiCheckSquare } from 'react-icons/fi';
import './ReviewerDashboard.css';
import Sidebar from "./common/Sidebar.jsx";

function ReviewerDashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [assignedApps, setAssignedApps] = useState([]);
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
                const profileRes = await axios.get('http://localhost:5256/api/profile/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (profileRes.data?.roleName === 'Reviewer') {
                    setUserData(profileRes.data);

                    const appsRes = await axios.get('http://localhost:5256/api/reviewer/assigned-applications', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setAssignedApps(appsRes.data.data || []);
                } else {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) return <div className="loading-screen">Loading...</div>;
    if (error) return <div className="error-screen">{error}</div>;

    const pendingCount = assignedApps.filter(app => app.status !== 'Rejected' && app.status !== 'Hired').length;

    return (
        <div className="dashboard-layout">
            <Sidebar role="Reviewer" activeItem="dashboard" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Reviewer Dashboard</h1>
                        <p>Welcome back, {userData?.firstName}</p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0284c7'}}>
                            <FiClock />
                        </div>
                        <div className="stat-info">
                            <h3>{pendingCount}</h3>
                            <p>Pending Reviews</p>
                        </div>
                    </div>
                </div>

                <div className="content-card full-width">
                    <div className="card-header">
                        <h2>Assigned Applications</h2>
                    </div>
                    <div className="card-body">
                        {assignedApps.length > 0 ? (
                            <div className="table-container">
                                <table className="dashboard-table">
                                    <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job Title</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {assignedApps.map(app => (
                                        <tr key={app.applicationId}>
                                            <td>
                                                <div className="job-title" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                    <div className="candidate-avatar-small" style={{width:'32px', height:'32px', borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:'600', color:'#6b7280'}}>
                                                        {app.candidateName.charAt(0)}
                                                    </div>
                                                    {app.candidateName}
                                                </div>
                                            </td>
                                            <td>{app.jobTitle}</td>
                                            <td>
                                                    <span className={`status-pill status-${app.status?.toLowerCase().replace(' ', '-')}`}>
                                                        {app.status}
                                                    </span>
                                            </td>
                                            <td>
                                                <Link to={`/applications/${app.applicationId}`} className="btn-action outline small">
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">No applications assigned for review.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ReviewerDashboard;