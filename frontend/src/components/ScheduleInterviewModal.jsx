import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Modal.css';

function ScheduleInterviewModal({ isOpen, onClose, application, onInterviewScheduled }) {
    const [interviewType, setInterviewType] = useState('Technical');
    const [scheduledAt, setScheduledAt] = useState('');
    const [availableInterviewers, setAvailableInterviewers] = useState([]);
    const [selectedInterviewers, setSelectedInterviewers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingInterviewers, setLoadingInterviewers] = useState(false);

    useEffect(() => {

        if (isOpen && application?.application_id) {
            const fetchInterviewers = async () => {
                setLoadingInterviewers(true); // Start loading
                setError('');
                const token = localStorage.getItem('token');
                try {

                    const response = await axios.get('http://localhost:5256/api/jobs/interviewers', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data?.success && Array.isArray(response.data.data)) {
                        const options = response.data.data.map(user => ({
                            value: user.userId,
                            label: `${user.name} (${user.email})`
                        }));
                        setAvailableInterviewers(options);
                    } else {

                        console.error("Received unexpected data format for interviewers:", response.data);
                        setError('Failed to load interviewers (unexpected format).');
                        setAvailableInterviewers([]);
                    }
                } catch (err) {
                    setError('Failed to load available interviewers.');
                    console.error("Fetch Interviewers Error:", err);
                    setAvailableInterviewers([]);
                } finally {
                    setLoadingInterviewers(false);
                }
            };
            fetchInterviewers();
        } else {

            setAvailableInterviewers([]);
            setSelectedInterviewers([]);
            setError('');
        }
    }, [isOpen, application]);

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
            roundNumber: 1,
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
                <h2>Schedule Interview</h2>
                <p>For: <strong>{application.candidate?.first_name || '...'} {application.candidate?.last_name || '...'}</strong></p>
                <form onSubmit={handleSubmit}>
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
                        <label>Assign Interviewer(s)</label>
                        <Select
                            isMulti
                            options={availableInterviewers}
                            value={selectedInterviewers}
                            onChange={setSelectedInterviewers}
                            isLoading={loadingInterviewers}
                            placeholder="Select one or more interviewers..."
                            isDisabled={loadingInterviewers || loading}
                            noOptionsMessage={() => loadingInterviewers ? "Loading..." : "No interviewers found"}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} disabled={loading} className="cancel-btn">Cancel</button>
                        <button type="submit" disabled={loadingInterviewers || loading}>{loading ? 'Scheduling...' : 'Schedule Interview'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ScheduleInterviewModal;

