import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FiX } from 'react-icons/fi'; // Import Close Icon
import '../common/Modal.css'; // Reuse existing modal styles

function AssignReviewerModal({ isOpen, onClose, jobId, onReviewerAssigned }) {
    const [availableReviewers, setAvailableReviewers] = useState([]);
    const [selectedReviewer, setSelectedReviewer] = useState(null);
    const [loadingReviewers, setLoadingReviewers] = useState(false);
    const [loadingAssign, setLoadingAssign] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch the list of available reviewers when the modal opens
        if (isOpen) {
            const fetchReviewers = async () => {
                setLoadingReviewers(true);
                setError('');
                const token = localStorage.getItem('token');
                try {
                    const response = await axios.get('http://localhost:5256/api/jobs/reviewers', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // Format the response for react-select
                    const options = response.data.data.map(user => ({
                        value: user.userId,
                        label: `${user.name} (${user.email})`
                    }));
                    setAvailableReviewers(options);
                } catch (err) {
                    setError('Failed to load available reviewers.');
                    console.error("Fetch Reviewers Error:", err);
                } finally {
                    setLoadingReviewers(false);
                }
            };
            fetchReviewers();
        }
    }, [isOpen]); // Re-fetch when modal opens

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReviewer) {
            setError('Please select a reviewer to assign.');
            return;
        }
        setLoadingAssign(true);
        setError('');

        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:5256/api/jobs/${jobId}/reviewers`,
                { reviewerUserId: selectedReviewer.value }, // Send selected reviewer's ID
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Optionally, call a function to refresh the job details page
            if (onReviewerAssigned) {
                onReviewerAssigned();
            }
            handleClose(); // Close modal on success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign reviewer.');
            console.error("Assign Reviewer Error:", err);
        } finally {
            setLoadingAssign(false);
        }
    };

    // Reset state and call parent onClose function
    const handleClose = () => {
        setSelectedReviewer(null);
        setError('');
        setAvailableReviewers([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* --- HEADER --- */}
                <div className="modal-header">
                    <h2>Assign Reviewer to Job</h2>
                    <button className="close-btn-icon" onClick={handleClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}
                    <form id="assign-reviewer-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Select Reviewer</label>
                            <Select
                                options={availableReviewers}
                                value={selectedReviewer}
                                onChange={setSelectedReviewer}
                                isLoading={loadingReviewers}
                                placeholder="Select a reviewer..."
                                isDisabled={loadingReviewers || loadingAssign}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </form>
                </div>

                {/* --- FOOTER --- */}
                <div className="modal-actions">
                    <button type="button" onClick={handleClose} disabled={loadingAssign} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" form="assign-reviewer-form" disabled={loadingReviewers || loadingAssign} className="btn-primary">
                        {loadingAssign ? 'Assigning...' : 'Assign Reviewer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssignReviewerModal;