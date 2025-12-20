import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiFileText, FiUploadCloud, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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
            fetchProfile();
            setCvFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed.');
            setUploadMessage('');
        }
    };

    if (loading) return <div className="loading-state">Loading profile...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!profile) return null;

    return (
        <div className="content-card full-width">
            <div className="card-header">
                <h2>My Profile & Documents</h2>
            </div>

            <div className="card-body">
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser /> Personal Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                        <div>
                            <label style={{ display: 'block', color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Full Name</label>
                            <div style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiUser className="text-muted" /> {profile.firstName} {profile.lastName}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email Address</label>
                            <div style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiMail className="text-muted" /> {profile.email}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Phone Number</label>
                            <div style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiPhone className="text-muted" /> {profile.phone || 'Not provided'}
                            </div>
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '2rem 0' }} />

                <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiFileText /> Curriculum Vitae (CV)
                    </h3>

                    {!profile.cvPath ? (
                        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.75rem', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                <FiAlertCircle size={24} color="#f97316" style={{ marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ margin: 0, color: '#9a3412' }}>CV Missing</h4>
                                    <p style={{ margin: '0.25rem 0 0 0', color: '#c2410c', fontSize: '0.9rem' }}>
                                        Your CV is not on file. Please upload it to complete your profile.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleCvUpload} className="upload-form-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    required
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white' }}
                                />
                                <button type="submit" className="btn-action primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiUploadCloud /> Upload CV
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '50%' }}>
                                    <FiCheckCircle size={24} color="#166534" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, color: '#166534' }}>CV Uploaded</h4>
                                    <p style={{ margin: '0.25rem 0 0 0', color: '#15803d', fontSize: '0.9rem' }}>
                                        Your CV is currently on file.
                                    </p>
                                </div>
                            </div>
                         </div>
                    )}

                    {uploadMessage && (
                        <p style={{ marginTop: '1rem', color: uploadMessage.includes('failed') ? '#ef4444' : '#10b981', fontWeight: 500, fontSize: '0.9rem', textAlign: 'center' }}>
                            {uploadMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileDocuments;