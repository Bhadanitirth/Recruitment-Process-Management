import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import './InterviewDetailsPage.css';
import './recruiter/RecruiterDashboard.css';
import Sidebar from "./common/Sidebar.jsx";

const SubmittedFeedback = ({ feedback }) => (
    <div className="submitted-feedback">
        <span style={{color: '#000000'}}>
        <h4>Feedback Submitted by {feedback.interviewerName}</h4>
        <p><strong>Recommendation:</strong> <span className={`rec-${feedback.recommendation?.toLowerCase()}`}>{feedback.recommendation || 'N/A'}</span></p>
        <p><strong>Comments:</strong></p>
        <p className="comments-box">{feedback.comments || "No comments."}</p>
        <p className="submitted-at">Submitted on: {new Date(feedback.submittedAt).toLocaleString()}</p>
        </span>
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
            <button type="submit" className="btn-action primary" disabled={isSubmitting} style={{width: '100%', justifyContent: 'center'}}>
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
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, []);

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
        const hasCurrentUserSubmitted = details.submittedFeedback?.some(fb => fb.interviewerId === details.currentUserId);

        if (details.status === 'Completed' || details.status === 'Cancelled') {
            return (
                <div>
                    <h4 style={{marginTop: 0, color: '#374151'}}>Interview Status: <span className={`status-pill status-${details.status.toLowerCase()}`}>{details.status}</span></h4>
                    <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0'}} />
                    {details.submittedFeedback && details.submittedFeedback.length > 0 ? (
                        details.submittedFeedback.map((fb, index) => <SubmittedFeedback key={index} feedback={fb} />)
                    ) : ( <p className="text-muted">No feedback was recorded.</p> )}
                </div>
            );
        }

        if (hasCurrentUserSubmitted) {
            return (
                <div>
                    <h4>Your Feedback is Submitted</h4>
                    {details.submittedFeedback.filter(fb => fb.interviewerId === details.currentUserId).map((fb, index) => <SubmittedFeedback key={index} feedback={fb} />)}
                    <p style={{marginTop: '1rem', fontStyle: 'italic', color: '#6b7280'}}>Waiting for other panel members or final decision...</p>
                </div>
            );
        }

        return <FeedbackForm onSubmit={handleSubmitFeedback} onError={setSubmitError} isSubmitting={isSubmitting} />;
    };

    const renderSidebar = () => {
        if (userRole === 'HR') return <Sidebar role="HR" activeItem="dashboard" />;
        if (userRole === 'Interviewer') return <Sidebar role="Interviewer" activeItem="dashboard" />;
        return <Sidebar role="Recruiter" activeItem="jobs" />;
    };

    const handleBack = () => {
        if (userRole === 'HR') navigate('/hr-dashboard');
        else if (userRole === 'Interviewer') navigate('/interviewer-dashboard');
        else navigate('/recruiter-dashboard');
    };

    if (loading) return <div className="loading-screen">Loading details...</div>;
    if (error) return <div className="error-screen">{error}</div>;
    if (!details) return <div className="error-screen">Interview not found.</div>;

    return (
        <div className="dashboard-layout">
            {renderSidebar()}

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1>Interview Details</h1>
                            <span className={`status-pill status-${details.status.toLowerCase()}`}>{details.status}</span>
                        </div>
                        <p>Interview ID: {interviewId}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-action outline" onClick={handleBack}>
                            <FiArrowLeft /> Back to Dashboard
                        </button>
                    </div>
                </header>

                <div className="content-grid">
                    <div className="content-card">
                        <div className="card-header"><span style={{color: '#000000'}}><h3>Candidate & Job Info</h3></span></div>
                        <div className="card-body">
                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{display:'block', color:'#6b7280', fontSize:'0.85rem', marginBottom:'0.25rem'}}>Candidate Name</label>
                                <div style={{fontWeight:600, color:'#111827', fontSize:'1.1rem'}}>{details.candidateName}</div>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{display:'block', color:'#6b7280', fontSize:'0.85rem', marginBottom:'0.25rem'}}>Position</label>
                                <div style={{fontWeight:600, color:'#111827'}}>{details.jobTitle}</div>
                            </div>

                            <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'1rem', marginBottom: '1.5rem'}}>
                                <div>
                                    <label style={{display:'block', color:'#6b7280', fontSize:'0.85rem', marginBottom:'0.25rem'}}>Interview Type</label>
                                    <div style={{fontWeight:500,color:'#000000'}}>{details.interviewType}</div>
                                </div>
                                <div>
                                    <label style={{display:'block', color:'#6b7280', fontSize:'0.85rem', marginBottom:'0.25rem'}}>Round</label>
                                    <div style={{fontWeight:500,color:'#000000'}}>{details.roundNumber}</div>
                                </div>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{display:'block', color:'#6b7280', fontSize:'0.85rem', marginBottom:'0.25rem'}}>Scheduled Time</label>
                                <div style={{fontWeight:600, color:'#111827'}}>{new Date(details.scheduledAt).toLocaleString()}</div>
                            </div>

                            {details.meetingLink && (
                                <div style={{marginBottom: '1.5rem', padding:'1rem', backgroundColor:'#f0f9ff', borderRadius:'0.5rem', border:'1px solid #bae6fd'}}>
                                    <p style={{margin:0, color:'#0369a1', fontWeight:500, marginBottom:'0.5rem'}}>Online Meeting Link:</p>
                                    <a href={details.meetingLink} target="_blank" rel="noopener noreferrer" style={{color:'#0284c7', fontWeight:'bold', textDecoration:'underline', wordBreak:'break-all'}}>
                                        {details.meetingLink}
                                    </a>
                                </div>
                            )}

                            {details.candidateCvPath ? (
                                <a href={`http://localhost:5256/${details.candidateCvPath}`} target="_blank" rel="noopener noreferrer" className="btn-action outline" style={{width:'100%', justifyContent:'center'}}>
                                    <FiDownload /> View Candidate CV
                                </a>
                            ) : (
                                <p className="text-muted">CV not available.</p>
                            )}

                            <div style={{marginTop: '2rem'}}>
                                <h4 style={{fontSize:'1rem', color:'#374151', marginBottom:'0.5rem'}}>Panel Members</h4>
                                <ul className="panel-list">
                                    {details.panelInterviewerNames.map((name, idx) => <li key={idx}>{name}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="content-card">
                        <div className="card-header"><span style={{color: '#000000'}}><h3>Evaluation & Feedback</h3></span></div>
                        <div className="card-body">
                            {renderFeedbackPanel()}
                            {submitError && <p className="error-message">{submitError}</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default InterviewDetailsPage;