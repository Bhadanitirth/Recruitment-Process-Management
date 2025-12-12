import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiBriefcase, FiUsers, FiBarChart2, FiLogOut, FiPlus, FiGrid, FiList, FiArrowRight } from 'react-icons/fi';
import './RecruiterDashboard.css';
import RecruiterSidebar from './RecruiterSidebar';
import CreateJobModal from './CreateJobModal';
import AddCandidateModal from './AddCandidateModal.jsx';
import BulkAddModal from './BulkAddModal';

function RecruiterDashboard() {
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    // --- NEW STATE for summary data ---
    const [summary, setSummary] = useState({ interviewsScheduled: 0 });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isJobModalOpen, setJobModalOpen] = useState(false);
    const [isCandidateModalOpen, setCandidateModalOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);

    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [jobsResponse, candidatesResponse, summaryResponse] = await Promise.all([
                axios.get('http://localhost:5256/api/jobs', { headers }),
                axios.get('http://localhost:5256/api/candidates', { headers }),
                // --- NEW API CALL ---
                axios.get('http://localhost:5256/api/reports/summary', { headers })
            ]);

            setJobs(jobsResponse.data.data || []);
            setCandidates(candidatesResponse.data.data || []);
            // --- SET SUMMARY DATA ---
            setSummary(summaryResponse.data.data || { interviewsScheduled: 0 });

        } catch (err) {
            setError('Failed to fetch data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            <RecruiterSidebar activePage="dashboard" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Overview</h1>
                        <p>Welcome back, Recruiter</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-action primary" onClick={() => setJobModalOpen(true)}>
                            <FiPlus /> Create Job
                        </button>
                        <button className="btn-action secondary" onClick={() => setCandidateModalOpen(true)}>
                            <FiPlus /> Add Candidate
                        </button>
                        <button className="btn-action outline" onClick={() => setBulkModalOpen(true)}>
                            Bulk Upload
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 'calc(100vh - 200px)',
                        width: '100%',
                        color: '#6B7280',
                        fontSize: '1.2rem',
                        fontWeight: '500'
                    }}>
                        Loading dashboard...
                    </div>
                ) : error ? (
                    <div className="error-screen">{error}</div>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon jobs-icon"><FiBriefcase /></div>
                                <div className="stat-info">
                                    <h3>{jobs.length}</h3>
                                    <p>Active Jobs</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon candidates-icon"><FiUsers /></div>
                                <div className="stat-info">
                                    <h3>{candidates.length}</h3>
                                    <p>Total Candidates</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon interviews-icon"><FiList /></div>
                                <div className="stat-info">
                                    {/* --- USE DYNAMIC DATA HERE --- */}
                                    <h3>{summary.interviewsScheduled}</h3>
                                    <p>Interviews Today</p>
                                </div>
                            </div>
                        </div>

                        <div className="content-grid">
                            {/* ... (Recent Jobs Section remains unchanged) ... */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h2>Open Positions</h2>
                                </div>
                                <div className="card-body">
                                    {jobs.length > 0 ? (
                                        <>
                                            <div className="table-container">
                                                <table className="dashboard-table">
                                                    <thead>
                                                    <tr>
                                                        <th>Title</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {jobs.slice(0, 3).map(job => (
                                                        <tr key={job.job_id}>
                                                            <td>
                                                                <div className="job-title">{job.title}</div>
                                                            </td>
                                                            <td>
                                                                    <span className={`status-pill ${job.status.toLowerCase().replace(' ', '-')}`}>
                                                                        {job.status}
                                                                    </span>
                                                            </td>
                                                            <td>
                                                                <Link to={`/jobs/${job.job_id}`} className="link-text">View Details</Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div style={{ marginTop: '1rem', textAlign: 'right', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                                <Link to="/recruiter/jobs" className="link-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                                    See All Jobs <FiArrowRight />
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="empty-state">No open jobs found.</div>
                                    )}
                                </div>
                            </div>

                            {/* ... (Recent Candidates Section remains unchanged) ... */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h2>Recent Candidates</h2>
                                    <span className="badge">New</span>
                                </div>
                                <div className="card-body">
                                    {candidates.length > 0 ? (
                                        <>
                                            <div className="candidate-list">
                                                {candidates.slice(0, 3).map(candidate => (
                                                    <div key={candidate.candidate_id} className="candidate-item">
                                                        <div className="candidate-avatar">
                                                            {candidate.first_name.charAt(0)}{candidate.last_name.charAt(0)}
                                                        </div>
                                                        <div className="candidate-details">
                                                            <h4>{candidate.first_name} {candidate.last_name}</h4>
                                                            <p>{candidate.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: '1rem', textAlign: 'right', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                                <Link to="/recruiter/candidates" className="link-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                                    See All Candidates <FiArrowRight />
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="empty-state">No candidates added yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <CreateJobModal
                isOpen={isJobModalOpen}
                onClose={() => setJobModalOpen(false)}
                onJobCreated={fetchData}
            />
            <AddCandidateModal
                isOpen={isCandidateModalOpen}
                onClose={() => setCandidateModalOpen(false)}
                onCandidateAdded={fetchData}
            />
            <BulkAddModal
                isOpen={isBulkModalOpen}
                onClose={() => setBulkModalOpen(false)}
                onCandidatesAdded={fetchData}
            />
        </div>
    );
}

export default RecruiterDashboard;