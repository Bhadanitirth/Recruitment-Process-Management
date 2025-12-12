import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FiX } from 'react-icons/fi'; // Import Close Icon
import '../common/Modal.css';

function CreateJobModal({ isOpen, onClose, onJobCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [allSkills, setAllSkills] = useState([]);
    const [requiredSkills, setRequiredSkills] = useState([]);
    const [preferredSkills, setPreferredSkills] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchSkills = async () => {
                const token = localStorage.getItem('token');
                try {
                    const response = await axios.get('http://localhost:5256/api/skills', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const formattedSkills = response.data.data.map(skill => ({
                        value: skill.skill_id,
                        label: skill.skill_name
                    }));
                    setAllSkills(formattedSkills);
                } catch (err) {
                    setError('Could not load skills.');
                }
            };
            fetchSkills();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const jobData = {
            title,
            description,
            requiredSkillIds: requiredSkills.map(s => s.value),
            preferredSkillIds: preferredSkills.map(s => s.value),
        };

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5256/api/jobs', jobData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onJobCreated();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create job.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setRequiredSkills([]);
        setPreferredSkills([]);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                    <h2>Create New Job</h2>
                    <button className="close-btn-icon" onClick={handleClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <form id="create-job-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Job Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Job Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the role responsibilities and requirements..."
                                rows="5"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Required Skills</label>
                            <Select
                                isMulti
                                options={allSkills}
                                value={requiredSkills}
                                onChange={setRequiredSkills}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select required skills..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Preferred Skills</label>
                            <Select
                                isMulti
                                options={allSkills}
                                value={preferredSkills}
                                onChange={setPreferredSkills}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select preferred skills..."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="modal-actions">
                    <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
                    <button type="submit" form="create-job-form" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Job'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateJobModal;