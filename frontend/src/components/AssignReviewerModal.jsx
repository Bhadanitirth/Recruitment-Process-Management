import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Modal.css';

function AssignReviewerModal({ isOpen, onClose, jobId, onReviewerAssigned }) {
    const [availableReviewers, setAvailableReviewers] = useState([]);
    const [selectedReviewer, setSelectedReviewer] = useState(null);
    const [loadingReviewers, setLoadingReviewers] = useState(false);
    const [loadingAssign, setLoadingAssign] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchReviewers = async () => {
                setLoadingReviewers(true);
                setError('');
                const token = localStorage.getItem('token');
                try {
                    const response = await axios.get('http://localhost:5256/api/jobs/reviewers', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
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
    }, [isOpen]);

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
                { reviewerUserId: selectedReviewer.value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (onReviewerAssigned) {
                onReviewerAssigned();
            }
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign reviewer.');
            console.error("Assign Reviewer Error:", err);
        } finally {
            setLoadingAssign(false);
        }
    };

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
                <h2>Assign Reviewer to Job</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Reviewer</label>
                        <Select
                            options={availableReviewers}
                            value={selectedReviewer}
                            onChange={setSelectedReviewer}
                            isLoading={loadingReviewers}
                            placeholder="Select a reviewer..."
                            isDisabled={loadingReviewers || loadingAssign}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} disabled={loadingAssign} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" disabled={loadingReviewers || loadingAssign}>
                            {loadingAssign ? 'Assigning...' : 'Assign Reviewer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssignReviewerModal;
