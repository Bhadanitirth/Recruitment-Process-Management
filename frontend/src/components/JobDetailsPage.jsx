import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LinkCandidateModal from './LinkCandidateModal';
import AssignReviewerModal from './AssignReviewerModal';
import './JobDetailsPage.css';

function JobDetailsPage() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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

    const handleReviewerAssigned = () => {
        console.log("Reviewer assigned!");
    };


    if (loading) return <div className="job-details-container">Loading job details...</div>;
    if (error) return <div className="job-details-container error-message">{error}</div>;
    if (!job) return <div className="job-details-container">Job not found. <Link to="/recruiter-dashboard">Go back</Link></div>;

    return (
        <div className="job-details-container">
            <header className="job-details-header">
                <div>
                    <h1>{job.title}</h1>
                    <span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span>
                </div>
                <div className="job-details-actions">
                    <button onClick={() => setLinkModalOpen(true)}>+ Link Candidate</button>
                    <button onClick={() => setAssignModalOpen(true)}>Assign Reviewer</button>
                </div>
            </header>

            <div className="job-description">
                <h3>Description</h3>
                <p>{job.description || "No description provided."}</p>
            </div>

            <div className="applications-list">
                <h3>Applied Candidates ({applications.length})</h3>
                <div className="item-list">
                    {applications.length > 0 ? (
                        applications.map(app => (
                            <Link to={`/applications/${app.application_id}`} key={app.application_id} className="list-item-link">
                                <div className="list-item">
                                    <div>
                                        <h3>{app.candidate?.first_name} {app.candidate?.last_name || '...'}</h3>
                                        <p>{app.candidate?.email || '...'}</p>
                                    </div>
                                    <span className={`status-badge status-${app.status?.toLowerCase()}`}>{app.status}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>No candidates have been linked to this job yet.</p>
                    )}
                </div>
            </div>

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

