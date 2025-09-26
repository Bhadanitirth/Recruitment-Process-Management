import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Modal.css';

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
                    // Format skills for react-select
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
                <h2>Create New Job</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Job Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Job Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
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
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} className="cancel-btn">Cancel</button>
                        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Job'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateJobModal;

