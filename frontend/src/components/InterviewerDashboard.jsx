import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileCard.css';

function InterviewerDashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5256/api/profile/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUserData(response.data);
            } catch (err) {
                setError('Failed to fetch profile data.');
                console.error(err);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (error) return <div className="profile-card error-message">{error}</div>;
    if (!userData) return <div className="profile-card">Loading...</div>;

    return (
        <div className="profile-card">
            <h1>Interviewer Dashboard</h1>
            <div className="user-info">
                <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Role:</strong> {userData.roleName}</p>
            </div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
}

export default InterviewerDashboard;
