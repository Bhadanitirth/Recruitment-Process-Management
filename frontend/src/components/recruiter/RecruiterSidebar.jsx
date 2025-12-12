import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiBarChart2, FiLogOut, FiGrid } from 'react-icons/fi';
import './RecruiterDashboard.css'; // Importing shared styles

function RecruiterSidebar({ activePage }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-brand">
                <h2>ROIMA<span className="brand-accent">Recruiter</span></h2>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
                    onClick={() => navigate('/recruiter-dashboard')}
                >
                    <FiGrid /> <span>Dashboard</span>
                </button>
                <button
                    className={`nav-item ${activePage === 'jobs' ? 'active' : ''}`}
                    onClick={() => navigate('/recruiter/jobs')}
                >
                    <FiBriefcase /> <span>Jobs</span>
                </button>
                <button
                    className={`nav-item ${activePage === 'candidates' ? 'active' : ''}`}
                    onClick={() => navigate('/recruiter/candidates')}
                >
                    <FiUsers /> <span>Candidates</span>
                </button>
                <button
                    className={`nav-item ${activePage === 'reports' ? 'active' : ''}`}
                    onClick={() => navigate('/reports')}
                >
                    <FiBarChart2 /> <span>Analytics</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="nav-item logout">
                    <FiLogOut /> <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default RecruiterSidebar;