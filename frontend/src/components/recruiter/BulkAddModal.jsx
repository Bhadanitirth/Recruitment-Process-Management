import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import '../common/Modal.css';

function BulkAddModal({ isOpen, onClose, onCandidatesAdded }) {
    const [excelFile, setExcelFile] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setExcelFile(e.target.files[0]);
        setError('');
        setMessage('');
    };

    const handleUpload = async () => {
        if (!excelFile) {
            setError('Please select a file to upload.');
            return;
        }
        setError('');
        setLoading(true);

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', excelFile);

        try {
            const response = await axios.post('http://localhost:5256/api/candidates/bulk-upload',
                formData,
                { headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }}
            );
            setMessage(response.data.message);
            onCandidatesAdded();
            // Optional: Close after success or keep open to show message
        } catch (err) {
            setError('Upload failed. Please check the file format.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* --- HEADER --- */}
                <div className="modal-header">
                    <h2>Bulk Add Candidates</h2>
                    <button className="close-btn-icon" onClick={onClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="modal-body">
                    <div style={{textAlign: 'center', marginBottom: '1.5rem', color: '#6B7280'}}>
                        <FiUploadCloud size={48} style={{marginBottom: '0.5rem', color: '#D1D5DB'}}/>
                        <p>Upload an Excel file (.xlsx) with columns:</p>
                        <p style={{fontWeight: 600, color: '#374151'}}>FirstName, LastName, Email, Phone, College Name</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="excelFile">Select Excel File</label>
                        <input
                            type="file"
                            id="excelFile"
                            onChange={handleFileChange}
                            accept=".xlsx"
                            style={{padding: '0.5rem'}}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                </div>

                {/* --- FOOTER --- */}
                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">Close</button>
                    <button type="button" onClick={handleUpload} className="btn-primary" disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BulkAddModal;