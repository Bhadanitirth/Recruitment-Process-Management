import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';

function BulkAddModal({ isOpen, onClose, onCandidatesAdded }) {
    const [excelFile, setExcelFile] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

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
        } catch (err) {
            setError('Upload failed. Please check the file format.');
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Bulk Add Candidates via Excel</h2>
                <p>Upload an Excel file (.xlsx) with columns: FirstName, LastName, Email, Phone.</p>

                <div className="form-group">
                    <label htmlFor="excelFile">Select Excel File</label>
                    <input type="file" id="excelFile" onChange={handleFileChange} accept=".xlsx" />
                </div>

                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">Close</button>
                    <button type="button" onClick={handleUpload} className="btn-primary">Upload</button>
                </div>
            </div>
        </div>
    );
}

export default BulkAddModal;
