import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LinkCandidateModal from './LinkCandidateModal';
import './JobDetailsPage.css';

function JobDetailsPage() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const jobsResponse = await axios.get('http://localhost:5256/api/jobs', { headers });
            const appsResponse = await axios.get('http://localhost:5256/api/applications', { headers }); // Assuming this endpoint exists

            const currentJob = jobsResponse.data.data.find(j => j.job_id.toString() === jobId);
            const jobApps = appsResponse.data.data.filter(a => a.job_id.toString() === jobId);

            setJob(currentJob);
            setApplications(jobApps);
        } catch (err) {
            setError('Failed to load job details.');
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div>Loading job details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!job) return <div>Job not found. <Link to="/recruiter-dashboard">Go back</Link></div>;

    return (
        <div className="job-details-container">
            <header className="job-details-header">
                <div>
                    <h1>{job.title}</h1>
                    <span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span>
                </div>
                <button onClick={() => setModalOpen(true)}>+ Link Candidate to Job</button>
            </header>

            <div className="job-description">
                <h3>Description</h3>
                <p>{job.description}</p>
            </div>

            <div className="applications-list">
                <h3>Applied Candidates ({applications.length})</h3>
                {applications.length > 0 ? (
                    applications.map(app => (
                        <div key={app.application_id} className="application-item">
                            <p>Candidate ID: {app.candidate_id}</p>
                            <p>Status: {app.status}</p>
                        </div>
                    ))
                ) : (
                    <p>No candidates have been linked to this job yet.</p>
                )}
            </div>

            <LinkCandidateModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                jobId={jobId}
                onCandidateLinked={fetchData}
            />
        </div>
    );
}

export default JobDetailsPage;
