import React, { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import '../common/Modal.css';

function AddCandidateModal({ isOpen, onClose, onCandidateAdded }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('FirstName', firstName);
        formData.append('LastName', lastName);
        formData.append('Email', email);
        formData.append('Phone', phone);
        formData.append('CollegeName', collegeName);

        if (cvFile) {
            formData.append('CvFile', cvFile);
        }

        try {
            await axios.post('http://localhost:5256/api/candidates',
                formData,
                { headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }}
            );
            onCandidateAdded();
            setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setCollegeName(''); setCvFile(null);
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add candidate.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Candidate</h2>
                    <button className="close-btn-icon" onClick={onClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <form id="add-candidate-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone (Optional)</label>
                            <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="collegeName">College Name</label>
                            <input type="text" id="collegeName" value={collegeName} onChange={e => setCollegeName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cvFile">Upload CV (Optional)</label>
                            <input
                                type="file"
                                id="cvFile"
                                onChange={e => setCvFile(e.target.files[0])}
                                accept=".pdf,.doc,.docx"
                                style={{padding: '0.5rem'}}
                            />
                        </div>
                    </form>
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" form="add-candidate-form" className="btn-primary" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Candidate'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddCandidateModal;