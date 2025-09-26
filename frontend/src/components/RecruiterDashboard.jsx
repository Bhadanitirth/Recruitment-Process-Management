import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './RecruiterDashboard.css';
import CreateJobModal from './CreateJobModal';
import AddCandidateModal from './AddCandidateModal';
import BulkAddModal from './BulkAddModal';
import { Link } from 'react-router-dom';

function RecruiterDashboard() {
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);

    const [isJobModalOpen, setJobModalOpen] = useState(false);
    const [isCandidateModalOpen, setCandidateModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [jobsResponse, candidatesResponse] = await Promise.all([
                axios.get('http://localhost:5256/api/jobs', { headers }),
                axios.get('http://localhost:5256/api/candidates', { headers })
            ]);
            setJobs(jobsResponse.data.data || []);
            setCandidates(candidatesResponse.data.data || []);
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

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <h1>Recruiter Dashboard</h1>
                <div className="dashboard-actions">
                    <button onClick={() => setJobModalOpen(true)}>+ Create New Job</button>
                    <button onClick={() => setCandidateModalOpen(true)}>+ Add New Candidate</button>
                    <button onClick={() => setBulkModalOpen(true)}>Bulk Add via Excel</button>
                </div>
            </header>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h2>{jobs.length}</h2>
                    <p>Open Positions</p>
                </div>
                <div className="stat-card">
                    <h2>{candidates.length}</h2>
                    <p>Candidates</p>
                </div>
                <div className="stat-card">
                    <h2>0</h2>
                    <p>Interviews Today</p>
                </div>
            </div>

            <main className="dashboard-main-content">
                <div className="content-column">
                    <h2>Open Job Positions</h2>
                    <div className="item-list">
                        {jobs.length > 0 ? jobs.map(job => (
                            <Link to={`/jobs/${job.job_id}`} key={job.job_id} className="list-item-link">
                                <div className="list-item">
                                    <h3>{job.title}</h3>
                                    <p>{job.status}</p>
                                </div>
                            </Link>
                        )) : <p>No open jobs found.</p>}
                    </div>
                </div>
                <div className="content-column">
                    <h2>Recently Added Candidates</h2>
                    <div className="item-list">
                        {candidates.length > 0 ? candidates.map(candidate => (
                            <div key={candidate.candidate_id} className="list-item">
                                <h3>{candidate.first_name} {candidate.last_name}</h3>
                                <p>{candidate.email}</p>
                            </div>
                        )) : <p>No candidates in the pool yet.</p>}
                    </div>
                </div>
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
