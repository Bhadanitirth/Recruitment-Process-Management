import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FiGrid, FiBriefcase, FiUsers, FiBarChart2, FiLogOut, FiList, FiUser,
    FiSettings, FiShield, FiFileText
} from 'react-icons/fi';
import './Sidebar.css';

const MENU_CONFIG = {
    Admin: [
        { id: 'dashboard', label: 'Overview', path: '/admin-dashboard', icon: FiGrid },
        { id: 'users', label: 'User Management', path: '/admin/users', icon: FiUsers },
        { id: 'reports', label: 'System Reports', path: '/reports', icon: FiBarChart2 } // Admin can view reports
    ],
    Recruiter: [
        { id: 'dashboard', label: 'Dashboard', path: '/recruiter-dashboard', icon: FiGrid },
        { id: 'jobs', label: 'Jobs', path: '/recruiter/jobs', icon: FiBriefcase },
        { id: 'candidates', label: 'Candidates', path: '/recruiter/candidates', icon: FiUsers },
        { id: 'reports', label: 'Analytics', path: '/reports', icon: FiBarChart2 }
    ],
    Interviewer: [
        { id: 'dashboard', label: 'My Interviews', path: '/interviewer-dashboard', icon: FiGrid }
    ],
    'Technical Interviewer': [
        { id: 'dashboard', label: 'My Interviews', path: '/interviewer-dashboard', icon: FiGrid }
    ],
    HR: [
        { id: 'dashboard', label: 'HR Dashboard', path: '/hr-dashboard', icon: FiGrid }
    ],
    Reviewer: [
        { id: 'dashboard', label: 'Dashboard', path: '/reviewer-dashboard', icon: FiGrid }
    ],
    Candidate: [
        { id: 'jobs', label: 'Job Listings', icon: FiBriefcase, isTab: true },
        { id: 'applications', label: 'My Applications', icon: FiList, isTab: true },
        { id: 'profile', label: 'Profile & Docs', icon: FiUser, isTab: true }
    ]
};

const Sidebar = ({ role, activeItem, onTabChange }) => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);

    // Normalize role to Title Case or match config keys
    // Backend roles might be "Technical Interviewer", config handles it.
    const menuItems = MENU_CONFIG[role] || MENU_CONFIG['Recruiter']; // Fallback

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                // Using the specific profile endpoint for standard users, or admin specific if needed
                // Assuming /api/profile/me works for everyone including Admin
                const response = await axios.get('http://localhost:5256/api/profile/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserProfile(response.data);
            } catch (error) {
                // Admin might not have a "Candidate/User" profile, handle gracefully
                const decoded = parseJwt(token);
                if(decoded) setUserProfile({ firstName: 'Admin', lastName: 'User', email: decoded.email });
            }
        };
        fetchProfile();
    }, []);

    const parseJwt = (token) => {
        try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        navigate('/login');
    };

    const handleNavigation = (item) => {
        if (item.isTab) {
            if (onTabChange) onTabChange(item.id);
        } else {
            navigate(item.path);
        }
    };

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-brand">
                <h2>ROIMA<span className="brand-accent">{role === 'Technical Interviewer' ? 'Tech' : role}</span></h2>
            </div>

            <nav className="sidebar-nav">
                {menuItems && menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => handleNavigation(item)}
                        >
                            <Icon /> <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                {userProfile && (
                    <div className="user-profile-badge">
                        <div className="user-avatar-placeholder">
                            {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
                        </div>
                        <div className="user-info-mini">
                            <p className="user-name">{userProfile.firstName} {userProfile.lastName}</p>
                            <p className="user-email">{userProfile.email}</p>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout} className="nav-item logout">
                    <FiLogOut /> <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;