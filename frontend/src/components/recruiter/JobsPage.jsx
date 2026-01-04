import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiSearch } from 'react-icons/fi';
import './RecruiterDashboard.css';
import CreateJobModal from './CreateJobModal';
import Sidebar from "../common/Sidebar.jsx";

function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isJobModalOpen, setJobModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [userRole, setUserRole] = useState(''); // State to hold the dynamic role
    const navigate = useNavigate();

    // 1. Detect the current user's role on mount
    useEffect(() => {
        const storedRole = localStorage.getItem('userType');
        setUserRole(storedRole || 'Recruiter'); // Default to Recruiter if missing
    }, []);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const response = await axios.get('http://localhost:5256/api/jobs', { headers });
            setJobs(response.data.data || []);
            setFilteredJobs(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch jobs.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    useEffect(() => {
        const results = jobs.filter(job =>
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredJobs(results);
    }, [searchTerm, jobs]);

    return (
        <div className="dashboard-layout">
            {/* 2. Pass the dynamic userRole to the Sidebar */}
            <Sidebar role={userRole} activeItem="jobs" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Jobs Management</h1>
                        <p>View and manage all job openings</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-action primary" onClick={() => setJobModalOpen(true)}>
                            <FiPlus /> Create New Job
                        </button>
                    </div>
                </header>

                <div className="content-card full-width">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>All Jobs</h2>
                        <div className="search-container">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search jobs by title or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="card-body">
                        {loading ? <div className="loading-state">Loading jobs...</div> : error ? <p className="error-message">{error}</p> : (
                            filteredJobs.length > 0 ? (
                                <table className="dashboard-table">
                                    <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Date Created</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredJobs.map(job => (
                                        <tr key={job.job_id}>
                                            <td><div className="job-title">{job.title}</div></td>
                                            <td><span style={{color: '#6b7280', fontSize: '0.9rem'}}>{job.description ? job.description.substring(0, 50) + '...' : ''}</span></td>
                                            <td><span className={`status-pill status-${job.status.toLowerCase().replace(' ', '-')}`}>{job.status}</span></td>
                                            <td><span style={{color: '#6b7280', fontSize: '0.9rem'}}>{new Date(job.created_at).toLocaleDateString()}</span></td>
                                            <td><Link to={`/jobs/${job.job_id}`} className="link-text">Manage</Link></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : <div className="empty-state">No jobs found matching "{searchTerm}".</div>
                        )}
                    </div>
                </div>
            </main>

            <CreateJobModal isOpen={isJobModalOpen} onClose={() => setJobModalOpen(false)} onJobCreated={fetchJobs} />
        </div>
    );
}

export default JobsPage;