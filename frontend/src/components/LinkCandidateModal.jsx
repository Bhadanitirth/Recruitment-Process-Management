import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Modal.css';

function LinkCandidateModal({ isOpen, onClose, jobId, onCandidateLinked }) {
    const [allCandidates, setAllCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchCandidates = async () => {
                const token = localStorage.getItem('token');
                try {
                    const response = await axios.get('http://localhost:5256/api/candidates', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const formattedCandidates = response.data.data.map(c => ({
                        value: c.candidate_id,
                        label: `${c.first_name} ${c.last_name} (${c.email})`
                    }));
                    setAllCandidates(formattedCandidates);
                } catch (err) {
                    setError('Could not load candidates.');
                }
            };
            fetchCandidates();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCandidate) {
            setError('Please select a candidate.');
            return;
        }
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:5256/api/jobs/${jobId}/apply`,
                { candidateId: selectedCandidate.value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onCandidateLinked();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to link candidate.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedCandidate(null);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Link Candidate to Job</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Candidate</label>
                        <Select
                            options={allCandidates}
                            value={selectedCandidate}
                            onChange={setSelectedCandidate}
                            placeholder="Search by name or email..."
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} className="cancel-btn">Cancel</button>
                        <button type="submit" disabled={loading}>{loading ? 'Linking...' : 'Link Candidate'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LinkCandidateModal;

