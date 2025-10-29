import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ApplicationReviewPage.css';

function ApplicationReviewPage() {
    const { applicationId } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');

    const fetchDetails = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
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
                { newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            fetchDetails();
        } catch (err) {
            alert('Failed to update status.');
        }
    };

    if (loading) return <div className="review-page-container">Loading...</div>;
    if (error) return <div className="review-page-container error-message">{error}</div>;
    if (!details) return null;

    return (
        <div className="review-page-container">
            <header className="review-header">
                <h1>Review Application</h1>
                <Link to="/recruiter-dashboard">Back to Dashboard</Link>
            </header>

            {details.pastApplications && details.pastApplications.length > 0 && (
                <div className="past-activity-notification">
                    <p><strong>⚠️ Past Activity:</strong> This candidate has applied for other positions before.</p>
                </div>
            )}

            <div className="review-grid">
                <div className="candidate-info-panel">
                    <h3>Candidate Details</h3>
                    <p><strong>Name:</strong> {details.candidateName}</p>
                    <p><strong>Email:</strong> {details.candidateEmail}</p>
                    <p><strong>Current Status:</strong> <span className={`status-badge status-${details.applicationStatus.toLowerCase()}`}>{details.applicationStatus}</span></p>
                    <a href={`http://localhost:5256/${details.candidateCvPath}`} target="_blank" rel="noopener noreferrer" className="view-cv-button">View CV</a>

                    <div className="action-buttons">
                        <h3>Actions</h3>
                        <button onClick={() => handleStatusUpdate('Shortlisted')}>Shortlist</button>
                        <button onClick={() => handleStatusUpdate('On Hold')}>On Hold</button>
                        <button className="reject-btn" onClick={() => handleStatusUpdate('Rejected')}>Reject</button>
                    </div>
                </div>

                <div className="comments-panel">
                    <h3>Comments</h3>
                    <form onSubmit={handleAddComment} className="comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add your review comment here..."
                            required
                        />
                        <button type="submit">Add Comment</button>
                    </form>
                    <div className="comments-log">
                        {details.comments && details.comments.length > 0 ? details.comments.map((comment, index) => (
                            <div key={index} className="comment-item">
                                <p className="comment-text">"{comment.commentText}"</p>
                                <p className="comment-meta">by <strong>{comment.authorName}</strong> on {new Date(comment.createdAt).toLocaleDateString()}</p>
                            </div>
                        )) : <p>No comments yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationReviewPage;
