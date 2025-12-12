import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiPlus, FiUserPlus, FiSearch } from 'react-icons/fi';
import LinkCandidateModal from './LinkCandidateModal';
import AssignReviewerModal from './AssignReviewerModal';
import RecruiterSidebar from './RecruiterSidebar';
import './RecruiterDashboard.css';
import './JobDetailsPage.css';

function JobDetailsPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]); // Filtered state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Search state
    const [isLinkModalOpen, setLinkModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [jobsResponse, appsResponse] = await Promise.all([
                axios.get('http://localhost:5256/api/jobs', { headers }),
                axios.get('http://localhost:5256/api/applications', { headers })
            ]);

            const currentJob = jobsResponse.data.data.find(j => j.job_id.toString() === jobId);
            const jobApps = appsResponse.data.data.filter(app => app.job_id.toString() === jobId);

            setJob(currentJob);
            setApplications(jobApps);
            setFilteredApplications(jobApps); // Initialize filtered list
            setError('');
        } catch (err) {
            setError('Failed to load job details. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter Logic
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const results = applications.filter(app => {
            const name = `${app.candidate?.first_name} ${app.candidate?.last_name}`.toLowerCase();
            const email = app.candidate?.email?.toLowerCase() || '';
            const status = app.status?.toLowerCase() || '';
            return name.includes(term) || email.includes(term) || status.includes(term);
        });
        setFilteredApplications(results);
    }, [searchTerm, applications]);

    const handleReviewerAssigned = () => {
        console.log("Reviewer assigned!");
    };

    if (loading) return <div className="loading-screen">Loading job details...</div>;
    if (error) return <div className="error-screen">{error}</div>;
    if (!job) return <div className="error-screen">Job not found. <Link to="/recruiter/jobs">Go back</Link></div>;

    return (
        <div className="dashboard-layout">
            <RecruiterSidebar activePage="jobs" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1>{job.title}</h1>
                            <span className={`status-pill ${job.status.toLowerCase().replace(' ', '-')}`}>
                                {job.status}
                            </span>
                        </div>
                        <p>Job ID: {job.job_id} • Created on {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-action outline" onClick={() => navigate('/recruiter/jobs')}>
                            <FiArrowLeft /> Back
                        </button>
                        <button className="btn-action secondary" onClick={() => setAssignModalOpen(true)}>
                            <FiUserPlus /> Assign Reviewer
                        </button>
                        <button className="btn-action primary" onClick={() => setLinkModalOpen(true)}>
                            <FiPlus /> Link Candidate
                        </button>
                    </div>
                </header>

                <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>

                    {/* Job Description Card */}
                    <div className="content-card">
                        <div className="card-header">
                            <h2>Description</h2>
                        </div>
                        <div className="card-body">
                            <p style={{ lineHeight: '1.6', color: '#374151' }}>
                                {job.description || "No description provided."}
                            </p>
                        </div>
                    </div>

                    {/* Applications List Card */}
                    <div className="content-card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{display:'flex', gap: '10px', alignItems:'center'}}>
                                <h2>Applied Candidates</h2>
                                <span className="badge">{applications.length}</span>
                            </div>

                            {/* Search Bar */}
                            <div className="search-container" style={{maxWidth: '300px'}}>
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search candidates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="card-body">
                            {filteredApplications.length > 0 ? (
                                <div className="table-container">
                                    <table className="dashboard-table">
                                        <thead>
                                        <tr>
                                            <th>Candidate Name</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Applied Date</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredApplications.map(app => (
                                            <tr key={app.application_id}>
                                                <td>
                                                    <div className="job-title">
                                                        {app.candidate?.first_name} {app.candidate?.last_name || '...'}
                                                    </div>
                                                </td>
                                                <td><span style={{color: '#6b7280', fontSize: '0.9rem'}}>{app.candidate?.email || '...'}</span></td>
                                                <td>
                                                        <span className={`status-pill status-${app.status?.toLowerCase().replace(' ', '-')}`}>
                                                            {app.status}
                                                        </span>
                                                </td>
                                                <td><span style={{color: '#6b7280', fontSize: '0.9rem'}}>{new Date(app.applied_at).toLocaleDateString()}</span></td>
                                                <td>
                                                    <Link to={`/applications/${app.application_id}`} className="link-text">
                                                        Review Application
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    {searchTerm ? `No candidates found matching "${searchTerm}".` : "No candidates have been linked to this job yet."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <LinkCandidateModal
                isOpen={isLinkModalOpen}
                onClose={() => setLinkModalOpen(false)}
                jobId={jobId}
                onCandidateLinked={fetchData}
            />
            <AssignReviewerModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                jobId={jobId}
                onReviewerAssigned={handleReviewerAssigned}
            />
        </div>
    );
}

export default JobDetailsPage;