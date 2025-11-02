import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InterviewDetailsPage.css';

const SubmittedFeedback = ({ feedback }) => (
    <div className="submitted-feedback">
        <h4>Feedback Submitted by {feedback.interviewerName}</h4>
        <p><strong>Recommendation:</strong> <span className={`rec-${feedback.recommendation?.toLowerCase()}`}>{feedback.recommendation || 'N/A'}</span></p>
        <p><strong>Comments:</strong></p>
        <p className="comments-box">{feedback.comments || "No comments."}</p>
        <p className="submitted-at">Submitted on: {new Date(feedback.submittedAt).toLocaleString()}</p>
    </div>
);

const FeedbackForm = ({ onSubmit, onError, isSubmitting }) => {
    const [feedback, setFeedback] = useState({ rating: null, comments: '', recommendation: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeedback(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!feedback.recommendation) {
            onError('Please select a recommendation.');
            return;
        }
        onSubmit(feedback);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Overall Recommendation</label>
                <select name="recommendation" value={feedback.recommendation} onChange={handleChange} required>
                    <option value="" disabled>-- Select --</option>
                    <option value="Proceed">Proceed to Next Round</option>
                    <option value="Hold">On Hold</option>
                    <option value="Reject">Reject</option>
                </select>
            </div>
            <div className="form-group">
                <label>Comments</label>
                <textarea
                    name="comments"
                    value={feedback.comments}
                    onChange={handleChange}
                    placeholder="Enter your detailed feedback here..."
                    rows="6"
                />
            </div>
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
        </form>
    );
};


function InterviewDetailsPage() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDetails = useCallback(async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5256/api/interviews/${interviewId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDetails(response.data.data);
            setError('');
        } catch (err) {
            console.error("Fetch Details Error:", err);
            setError('Failed to load interview details.');
        } finally {
            setLoading(false);
        }
    }, [interviewId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleSubmitFeedback = async (feedbackData) => {
        setIsSubmitting(true);
        setSubmitError('');
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:5256/api/interviews/${interviewId}/feedback`, feedbackData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Feedback submitted successfully!');
            fetchDetails();
        } catch (err) {
            console.error("Submit Feedback Error:", err);
            setSubmitError(err.response?.data?.message || 'Failed to submit feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFeedbackPanel = () => {
        const hasCurrentUserSubmitted = details.submittedFeedback?.some(
            fb => fb.interviewerId === details.currentUserId
        );

        if (details.status === 'Completed' || details.status === 'Cancelled') {
            return (
                <div>
                    <h4>Interview {details.status}</h4>
                    {details.submittedFeedback && details.submittedFeedback.length > 0 ? (
                        details.submittedFeedback.map((fb, index) => (
                            <SubmittedFeedback key={index} feedback={fb} />
                        ))
                    ) : (
                        <p>This interview is {details.status}, and no feedback was recorded.</p>
                    )}
                </div>
            );
        }

        if (hasCurrentUserSubmitted) {
            return (
                <div>
                    <h4>Your Feedback is Submitted</h4>
                    {details.submittedFeedback
                        .filter(fb => fb.interviewerId === details.currentUserId)
                        .map((fb, index) => (
                            <SubmittedFeedback key={index} feedback={fb} />
                        ))}
                    <p style={{marginTop: '1rem', fontStyle: 'italic', color: '#6b7280'}}>
                        Waiting for other panel members...
                    </p>
                </div>
            );
        }

        return (
            <FeedbackForm
                onSubmit={handleSubmitFeedback}
                onError={setSubmitError}
                isSubmitting={isSubmitting}
            />
        );
    };

    if (loading) return <div className="interview-details-container">Loading...</div>;
    if (error) return <div className="interview-details-container error-message">{error}</div>;
    if (!details) return null;

    return (
        <div className="interview-details-container">
            <header className="details-header">
                <h1>Interview Details</h1>
                <Link to="/interviewer-dashboard">Back to Dashboard</Link>
            </header>

            <div className="details-grid">
                <div className="candidate-job-info">
                    <h3>Candidate & Job</h3>
                    <p><strong>Candidate:</strong> {details.candidateName}</p>
                    <p><strong>Job:</strong> {details.jobTitle}</p>
                    <p><strong>Round:</strong> {details.roundNumber}</p>
                    <p><strong>Type:</strong> {details.interviewType}</p>
                    <p><strong>Scheduled:</strong> {new Date(details.scheduledAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${details.status.toLowerCase()}`}>{details.status}</span></p>
                    {details.candidateCvPath &&
                        <a href={`http://localhost:5256/${details.candidateCvPath}`} target="_blank" rel="noopener noreferrer" className="view-cv-button">View CV</a>
                    }
                    <h4>Panel Interviewers:</h4>
                    <ul className="panel-list">
                        {details.panelInterviewerNames.map((name, idx) => <li key={idx}>{name}</li>)}
                    </ul>
                </div>

                <div className="feedback-form-panel">
                    <h3>Feedback</h3>
                    {renderFeedbackPanel()}
                    {submitError && <p className="error-message">{submitError}</p>}
                </div>
            </div>
        </div>
    );
}

export default InterviewDetailsPage;

