import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './DashboardPage.css';

function DashboardPage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {

                const decodedToken = jwtDecode(token);
                setUserData({
                    email: decodedToken.name,
                    role: decodedToken.role
                });
            } catch (error) {
                console.error("Failed to decode token:", error);
                handleLogout();
            }
        } else {

            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };


    if (!userData) {
        return <div>Loading...</div>;
    }


    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p className="dashboard-welcome-message">You are logged in successfully.</p>
            <div className="user-info">
                <p><strong>Logged in as:</strong> {userData.email}</p>
                <p><strong>Your Role:</strong> {userData.role}</p>
            </div>
            <button
                onClick={handleLogout}
                className="logout-button"
            >
                Logout
            </button>
        </div>
    );
}

export default DashboardPage;

