import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfileDocuments() {
    const [profile, setProfile] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploadMessage, setUploadMessage] = useState('');

    const fetchProfile = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:5256/api/candidate/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProfile(response.data.data);
        } catch (err) {
            setError('Could not load your profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleFileChange = (e) => {
        setCvFile(e.target.files[0]);
    };

    const handleCvUpload = async (e) => {
        e.preventDefault();
        if (!cvFile) {
            setError('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', cvFile);
        const token = localStorage.getItem('token');

        try {
            setUploadMessage('Uploading...');
            const response = await axios.post('http://localhost:5256/api/candidate/cv-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setUploadMessage(response.data.message);
            // Refresh the profile data to show the change
            fetchProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed.');
            setUploadMessage('');
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!profile) return null;

    return (
        <div className="profile-documents-container">
            <h2>My Profile & Documents</h2>
            <div className="profile-details">
                <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
            </div>

            <div className="documents-section">
                <h3>Curriculum Vitae (CV)</h3>

                {/* --- Conditional UI Logic --- */}
                {!profile.cvPath ? (
                    <div className="upload-section">
                        <p className="status-warning">Your CV is not on file. Please upload it.</p>
                        <form onSubmit={handleCvUpload}>
                            <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
                            <button type="submit">Upload CV</button>
                        </form>
                    </div>
                ) : (
                    <div className="upload-section">
                        <p className="status-success">Your CV has been uploaded successfully.</p>
                        {/* Placeholder for future document uploads */}
                        <div className="submit-docs-placeholder">
                            <h4>Submit Other Documents</h4>
                            <p>This feature will be available soon.</p>
                            <button disabled>Submit Documents</button>
                        </div>
                    </div>
                )}
                {uploadMessage && <p>{uploadMessage}</p>}
            </div>
        </div>
    );
}

export default ProfileDocuments;
