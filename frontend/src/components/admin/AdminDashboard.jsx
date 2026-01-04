import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiBriefcase, FiFileText, FiCheckCircle, FiGrid, FiSettings, FiBarChart2, FiList } from 'react-icons/fi';
import Sidebar from '../common/Sidebar';
import '../recruiter/RecruiterDashboard.css'; // Reusing consistent styles

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        hiredCandidates: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5256/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = response.data.data;

                // Handle potentially inconsistent casing from API
                setStats({
                    totalUsers: data.totalUsers || data.TotalUsers || 0,
                    totalJobs: data.totalJobs || data.TotalJobs || 0,
                    totalApplications: data.totalApplications || data.TotalApplications || 0,
                    hiredCandidates: data.hiredCandidates || data.HiredCandidates || 0
                });
            } catch (err) {
                console.error("Admin stats error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [navigate]);

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" activeItem="dashboard" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Admin Overview</h1>
                        <p>System-wide metrics and configuration</p>
                    </div>
                </header>

                {loading ? (
                    <div className="loading-state">Loading dashboard data...</div>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue" style={{ color: '#2563eb' }}>
                                    <FiUsers size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalUsers}</h3>
                                    <p>Total Users</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple" style={{ color: '#9333ea' }}>
                                    <FiBriefcase size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalJobs}</h3>
                                    <p>Total Jobs</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon orange" style={{ color: '#ea580c' }}>
                                    <FiFileText size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalApplications}</h3>
                                    <p>Total Applications</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green" style={{ color: '#16a34a' }}>
                                    <FiCheckCircle size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.hiredCandidates}</h3>
                                    <p>Hired Candidates</p>
                                </div>
                            </div>
                        </div>

                        <div className="content-grid two-col" style={{ marginTop: '2rem' }}>
                            {/* Management Actions Card */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h2>Quick Management</h2>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                                        Access key administrative functions for user and role management.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        <button
                                            className="btn-action primary"
                                            onClick={() => navigate('/admin/users')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            <FiUsers /> Manage Users
                                        </button>
                                        <button
                                            className="btn-action secondary"
                                            onClick={() => navigate('/recruiter/jobs')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            <FiBriefcase /> View All Jobs
                                        </button>
                                        <button
                                            className="btn-action outline"
                                            onClick={() => navigate('/recruiter/candidates')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            <FiList /> View Candidates
                                        </button>
                                        <button
                                            className="btn-action outline"
                                            onClick={() => navigate('/reports')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            <FiBarChart2 /> System Reports
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* System Status or Secondary Actions */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h2>System Status</h2>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                                <FiGrid className="text-muted" /> Dashboard Version
                                            </span>
                                            <span className="status-pill status-active" style={{ color: '#374151' }}>v1.0.0</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                                <FiCheckCircle className="text-muted" /> System Health
                                            </span>
                                            <span className="status-pill status-hired">Operational</span>
                                        </div>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <button
                                                className="btn-action outline"
                                                style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                onClick={() => navigate('/reports')}
                                            >
                                                <FiSettings /> View Detailed Logs
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;