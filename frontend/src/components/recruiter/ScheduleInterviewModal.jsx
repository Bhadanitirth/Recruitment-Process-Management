import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FiX } from 'react-icons/fi'; // Import Close Icon
import '../common/Modal.css';

function ScheduleInterviewModal({ isOpen, onClose, application, onInterviewScheduled }) {
    // Default to 'Technical'
    const [interviewType, setInterviewType] = useState('Technical');
    const [scheduledAt, setScheduledAt] = useState('');
    const [availableInterviewers, setAvailableInterviewers] = useState([]);
    const [selectedInterviewers, setSelectedInterviewers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingInterviewers, setLoadingInterviewers] = useState(false);

    // Fetch interviewers logic (unchanged logic, just re-wrapped in new UI structure)
    useEffect(() => {
        if (!isOpen || !application?.application_id) return;

        const fetchInterviewers = async () => {
            setLoadingInterviewers(true);
            setError('');
            setAvailableInterviewers([]); // Clear previous list
            setSelectedInterviewers([]); // Clear selection

            const token = localStorage.getItem('token');
            let url = '';

            // Set the correct API endpoint based on the selected interview type
            if (interviewType === 'HR') {
                url = 'http://localhost:5256/api/jobs/hr';
            } else if (interviewType === 'Technical' || interviewType === 'Online Test') {
                url = 'http://localhost:5256/api/jobs/interviewers';
            } else {
                setLoadingInterviewers(false);
                return; // Do nothing if no type is selected
            }

            try {
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data?.success && Array.isArray(response.data.data)) {
                    const options = response.data.data.map(user => ({
                        value: user.userId,
                        label: `${user.name} (${user.email})`
                    }));
                    setAvailableInterviewers(options);
                } else {
                    setError('Failed to load interviewers (unexpected format).');
                }
            } catch (err) {
                setError('Failed to load available interviewers.');
                console.error("Fetch Interviewers Error:", err);
            } finally {
                setLoadingInterviewers(false);
            }
        };

        fetchInterviewers();
    }, [isOpen, application, interviewType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!scheduledAt || selectedInterviewers.length === 0) {
            setError('Please fill in date/time and select at least one interviewer.');
            return;
        }
        setLoading(true);
        setError('');

        const scheduleData = {
            applicationId: application.application_id,
            roundNumber: 1, // Logic handles correct round calculation in backend
            interviewType: interviewType,
            scheduledAt: scheduledAt,
            interviewerIds: selectedInterviewers.map(i => i.value),
        };

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5256/api/interviews', scheduleData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onInterviewScheduled();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to schedule interview.');
            console.error("Schedule Interview Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setInterviewType('Technical');
        setScheduledAt('');
        setSelectedInterviewers([]);
        setError('');
        setAvailableInterviewers([]);
        onClose();
    };

    if (!isOpen || !application) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* --- HEADER --- */}
                <div className="modal-header">
                    <h2>Schedule Interview</h2>
                    <button className="close-btn-icon" onClick={handleClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="modal-body">
                    <p style={{marginBottom: '1.5rem', color: '#6B7280'}}>
                        For: <strong style={{color: '#111827'}}>{application.candidate?.first_name || '...'} {application.candidate?.last_name || '...'}</strong>
                    </p>

                    {error && <div className="error-message">{error}</div>}

                    <form id="schedule-interview-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Interview Type</label>
                            <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} required disabled={loading}>
                                <option value="Technical">Technical</option>
                                <option value="HR">HR</option>
                                <option value="Online Test">Online Test</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Date and Time</label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Assign Interviewer(s) ({interviewType})</label>
                            <Select
                                isMulti
                                options={availableInterviewers}
                                value={selectedInterviewers}
                                onChange={setSelectedInterviewers}
                                isLoading={loadingInterviewers}
                                placeholder={`Select ${interviewType} interviewers...`}
                                isDisabled={loadingInterviewers || loading}
                                noOptionsMessage={() => loadingInterviewers ? "Loading..." : `No ${interviewType} users found`}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </form>
                </div>

                {/* --- FOOTER --- */}
                <div className="modal-actions">
                    <button type="button" onClick={handleClose} disabled={loading} className="btn-secondary">Cancel</button>
                    <button type="submit" form="schedule-interview-form" className="btn-primary" disabled={loadingInterviewers || loading}>
                        {loading ? 'Scheduling...' : 'Schedule Interview'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ScheduleInterviewModal;