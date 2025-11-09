import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './HRDashboard.css';

function HRDashboard() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchHrDashboard = async () => {
            try {
                const response = await axios.get('http://localhost:5256/api/hr/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setApplications(response.data.data || []);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHrDashboard();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div className="hr-dashboard-container">Loading...</div>;
    if (error) return <div className="hr-dashboard-container error-message">{error}</div>;

    return (
        <div className="hr-dashboard-container">
            <header className="dashboard-header">
                <h1>HR Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </header>

            <div className="hr-application-list">
                <h2>Final Stage Candidates</h2>
                <p>Candidates who are Shortlisted, Offered, or Hired.</p>
                <div className="item-list">
                    {applications.length > 0 ? applications.map(app => (
                        <Link to={`/applications/${app.applicationId}/documents`} key={app.applicationId} className="list-item-link">
                            <div className="list-item">
                                <div>
                                    <h3>{app.candidateName}</h3>
                                    <p>{app.jobTitle}</p>
                                </div>
                                <span className={`status-badge status-${app.status.toLowerCase().replace(' ', '-')}`}>
                                    {app.status}
                                </span>
                            </div>
                        </Link>
                    )) : (
                        <p>No candidates are in the final stage pipeline.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HRDashboard;