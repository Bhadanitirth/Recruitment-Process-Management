import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ReviewerDashboard.css';

function ReviewerDashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [assignedApps, setAssignedApps] = useState([]); // State for assigned applications
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingApps, setLoadingApps] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                const response = await axios.get('http://localhost:5256/api/profile/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data?.roleName === 'Reviewer') {
                    setUserData(response.data);
                } else {
                    handleLogout();
                }
            } catch (err) {
                setError('Failed to fetch profile data.');
                handleLogout();
            } finally {
                setLoadingProfile(false);
            }
        };

        const fetchAssignedApps = async () => {
            setLoadingApps(true);
            try {
                const response = await axios.get('http://localhost:5256/api/reviewer/assigned-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAssignedApps(response.data.data || []);
            } catch (err) {
                setError('Failed to fetch assigned applications.');
            } finally {
                setLoadingApps(false);
            }
        };

        fetchProfile();
        fetchAssignedApps();

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loadingProfile || loadingApps) return <div className="reviewer-card">Loading...</div>;
    if (error) return <div className="reviewer-card error-message">{error}</div>;
    if (!userData) return null;

    return (
        <div className="reviewer-card">
            <h1>Reviewer Dashboard</h1>
            <div className="reviewer-info">
                <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Role:</strong> {userData.roleName}</p>
            </div>

            <div className="assigned-applications">
                <h2>Applications Assigned for Review</h2>
                {assignedApps.length > 0 ? (
                    <ul className="application-list">
                        {assignedApps.map(app => (
                            <li key={app.applicationId}>
                                <Link to={`/applications/${app.applicationId}`}>
                                    <strong>{app.candidateName}</strong> for {app.jobTitle}
                                </Link>
                                <span className={`status-badge status-${app.status.toLowerCase().replace(' ', '-')}`}>
                                  {app.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: '#6b7280' }}>No applications are currently assigned to you for review.</p>
                )}
            </div>
            <button onClick={handleLogout} className="logout-button" style={{ marginTop: '20px' }}>Logout</button>
        </div>
    );
}

export default ReviewerDashboard;

