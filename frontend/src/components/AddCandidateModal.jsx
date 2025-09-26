import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';

function AddCandidateModal({ isOpen, onClose, onCandidateAdded }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [cvFile, setCvFile] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('FirstName', firstName);
        formData.append('LastName', lastName);
        formData.append('Email', email);
        formData.append('Phone', phone);
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
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add candidate.';
            setError(errorMessage);
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New Candidate</h2>
                <form onSubmit={handleSubmit}>
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
                        <label htmlFor="cvFile">Upload CV (Optional)</label>
                        <input type="file" id="cvFile" onChange={e => setCvFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Add Candidate</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCandidateModal;

