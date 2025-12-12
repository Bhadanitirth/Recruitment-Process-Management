import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import RecruiterSidebar from './RecruiterSidebar'; // Import sidebar
import './RecruiterDashboard.css'; // Use shared dashboard styles
import './ApplicationReviewPage.css';

function ApplicationReviewPage() {
    const { applicationId } = useParams();
    const navigate = useNavigate(); // Hook for navigation
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);

    const fetchDetails = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading((prevLoading) => !details);
            const response = await axios.get(`http://localhost:5256/api/applications/${applicationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDetails(response.data.data);
        } catch (err) {
            setError('Failed to load application details.');
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:5256/api/applications/${applicationId}/comments`,
                { commentText: newComment },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setNewComment('');
            fetchDetails();
        } catch (err) {
            alert('Failed to add comment.');
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) return;

        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5256/api/applications/${applicationId}/status`,
                { newStatus: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            fetchDetails();
        } catch (err) {
            alert('Failed to update status.');
        }
    };

    const renderActionButtons = () => {
        if (!details) return null;
        const status = details.applicationStatus;

        switch (status) {
            case 'Applied':
            case 'Screening':
                return (
                    <>
                        <button onClick={() => handleStatusUpdate('Shortlisted')}>Shortlist</button>
                        <button onClick={() => handleStatusUpdate('On Hold')}>On Hold</button>
                        <button className="reject-btn" onClick={() => handleStatusUpdate('Rejected')}>Reject</button>
                    </>
                );

            case 'On Hold':
                return (
                    <>
                        <button onClick={() => handleStatusUpdate('Shortlisted')}>Re-activate (Shortlist)</button>
                        <button className="reject-btn" onClick={() => handleStatusUpdate('Rejected')}>Reject</button>
                    </>
                );

            case 'Shortlisted':
                return (
                    <button onClick={() => setScheduleModalOpen(true)} className="schedule-btn">
                        Schedule Interview
                    </button>
                );

            case 'Interview':
                return (
                    <div className="interview-details-box">
                        <h4>Interview Scheduled</h4>
                        <p><strong>Type:</strong> {details.latestInterviewType || 'N/A'}</p>
                        <p><strong>When:</strong> {details.latestInterviewScheduledAt ? new Date(details.latestInterviewScheduledAt).toLocaleString() : 'N/A'}</p>
                        <p><strong>Status:</strong> <span className={`status-badge status-${details.latestInterviewStatus?.toLowerCase()}`}>{details.latestInterviewStatus || 'N/A'}</span></p>
                    </div>
                );

            case 'Rejected':
            case 'Hired':
                return <p>No further review actions for this status.</p>;

            default:
                return null;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    if (loading) return <div className="loading-screen">Loading application details...</div>;
    if (error) return <div className="error-screen">{error}</div>;
    if (!details) return <div className="error-screen">Application not found.</div>;

    const applicationForModal = {
        application_id: details.applicationId,
        job_id: details.jobId,
        candidate: {
            first_name: details.candidateName?.split(' ')[0],
            last_name: details.candidateName?.split(' ').slice(1).join(' ')
        }
    };

    return (
        <div className="dashboard-layout">
            <RecruiterSidebar activePage="jobs" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1>Review Application</h1>
                            <span className={`status-pill status-${details.applicationStatus.toLowerCase().replace(' ', '-')}`}>
                                {details.applicationStatus}
                            </span>
                        </div>
                        <p>Application ID: {details.applicationId} • for {details.candidateName}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-action outline" onClick={() => navigate(-1)}> {/* Navigate back in history */}
                            <FiArrowLeft /> Back
                        </button>
                    </div>
                </header>

                <div className="review-grid"> {/* Use existing grid layout but improved */}

                    {/* Left Column: Candidate Info */}
                    <div className="content-card candidate-info-panel">
                        <div className="card-header">
                            <h2>Candidate Details</h2>
                        </div>
                        <div className="card-body">
                            {details.pastApplications && details.pastApplications.length > 0 && (
                                <div className="past-activity-notification" style={{marginBottom: '1.5rem'}}>
                                    <p><strong>⚠️ Past Activity:</strong> This candidate has applied for other positions before.</p>
                                </div>
                            )}

                            <p><strong>Name:</strong> {details.candidateName}</p>
                            <p><strong>Email:</strong> {details.candidateEmail}</p>

                            {details.candidateCvPath ? (
                                <a href={`http://localhost:5256/${details.candidateCvPath}`} target="_blank" rel="noopener noreferrer" className="view-cv-button">View CV</a>
                            ) : (
                                <p className="error-message">CV not yet uploaded.</p>
                            )}

                            {details.interviewHistory && details.interviewHistory.length > 0 && (
                                <div className="interview-history-section">
                                    <h4>Interview History</h4>
                                    <ul className="history-list">
                                        {details.interviewHistory.map((round, idx) => (
                                            <li key={idx} className={`history-round status-${round.status.toLowerCase()}`}>
                                                <div className="round-top">
                                                    <span className="round-number">Round {round.roundNumber}</span>
                                                    <span className="round-status">{round.status}</span>
                                                </div>
                                                <div className="round-detail">
                                                    <strong>{round.interviewType}</strong>
                                                    <span>{formatDateTime(round.scheduledAt)}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="action-buttons">
                                <h3>Actions</h3>
                                {renderActionButtons()}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Comments */}
                    <div className="content-card comments-panel">
                        <div className="card-header">
                            <h2>Comments & Feedback</h2>
                        </div>
                        <div className="card-body">
                            <div className="comments-log">
                                {details.comments && details.comments.length > 0 ? details.comments.map((comment, index) => (
                                    <div key={index} className="comment-item">
                                        <p className="comment-text">"{comment.commentText}"</p>
                                        <p className="comment-meta">by <strong>{comment.authorName}</strong> on {new Date(comment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                )) : <p style={{color: '#6b7280', fontStyle: 'italic'}}>No comments yet.</p>}
                            </div>
                            <form onSubmit={handleAddComment} className="comment-form">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add internal note..."
                                    required
                                />
                                <button type="submit">Add Note</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <ScheduleInterviewModal
                isOpen={isScheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                application={applicationForModal}
                onInterviewScheduled={fetchDetails}
            />
        </div>
    );
}

export default ApplicationReviewPage;