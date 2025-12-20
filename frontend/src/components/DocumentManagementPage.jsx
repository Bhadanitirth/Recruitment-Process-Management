import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FiArrowLeft, FiFileText, FiDownload, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import './DocumentManagementPage.css';
import './recruiter/RecruiterDashboard.css';
import Sidebar from "./common/Sidebar.jsx";

function DocumentRow({ doc, userRole, onVerify, onReject }) {
    return (
        <div className="doc-row">
            <div className="doc-info">
                <span className="doc-type">{doc.documentType}</span>
                <span className="doc-uploader">Uploaded by: {doc.uploaderName}</span>
                <span className={`doc-status status-${doc.verificationStatus.toLowerCase()}`}>{doc.verificationStatus}</span>
            </div>
            <div className="doc-actions">
                <a href={`http://localhost:5256/${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="doc-btn">View</a>
                {userRole !== 'Candidate' && doc.verificationStatus === 'Pending' && (
                    <>
                        <button onClick={() => onVerify(doc.documentId)} className="doc-btn verify">Verify</button>
                        <button onClick={() => onReject(doc.documentId)} className="doc-btn reject">Reject</button>
                    </>
                )}
            </div>
        </div>
    );
}

function DocumentManagementPage() {

    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('CV');
    const [uploadError, setUploadError] = useState('');
    const [joiningDate, setJoiningDate] = useState('');

    const getToken = () => localStorage.getItem('token');

    const fetchDocuments = useCallback(async () => {
        const token = getToken();
        try {
            const response = await axios.get(`http://localhost:5256/api/applications/${applicationId}/documents`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDocuments(response.data.data || []);
        } catch (err) {
            setError('Failed to load documents.');
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        const token = getToken();
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.role);
        }
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileUpload = async (e, docType) => {
        e.preventDefault();
        let fileToUpload = file;
        let finalDocType = docType || documentType;
        if (!fileToUpload) { setUploadError('Please select a file.'); return; }
        const formData = new FormData();
        formData.append('File', fileToUpload);
        const token = getToken();
        setUploadError('');
        let url = `http://localhost:5256/api/applications/${applicationId}/documents`;
        if(docType === 'Offer Letter') {
            url = `http://localhost:5256/api/applications/${applicationId}/documents/offer-letter`;
            formData.delete('File'); formData.append('file', fileToUpload);
        } else { formData.append('DocumentType', finalDocType); }
        try { await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } }); setFile(null); if (e.target) { e.target.reset(); } fetchDocuments(); } catch (err) { setUploadError(err.response?.data?.message || 'Upload failed.'); }
    };

    const handleDocumentAction = async (docId, action) => {
        const token = getToken();
        const url = `http://localhost:5256/api/hr/documents/${docId}/${action}`;
        try { await axios.put(url, {}, { headers: { 'Authorization': `Bearer ${token}` } }); fetchDocuments(); } catch (err) { alert(`Failed to ${action} document.`); }
    };

    const handleFinalizeSelection = async (e) => {
        e.preventDefault();
        const token = getToken();
        try { await axios.put(`http://localhost:5256/api/hr/applications/${applicationId}/select`, { joiningDate }, { headers: { 'Authorization': `Bearer ${token}` } }); alert('Candidate marked as Hired!'); fetchDocuments(); } catch (err) { alert('Failed to finalize selection.'); }
    };

    const handleBackClick = () => {
        if (userRole === 'Candidate') return navigate('/candidate-dashboard');
        if (userRole === 'HR') return navigate('/hr-dashboard');
        return navigate('/recruiter-dashboard');
    };

    const renderSidebar = () => {
        if (userRole === 'Candidate') return <Sidebar activeItem="applications" setActiveTab={() => navigate('/candidate-dashboard')} />;
        if (userRole === 'HR') return <Sidebar activeItem="dashboard" />;
        return <Sidebar activeItem="candidates" />;
    };

    if (loading) return <div className="loading-screen">Loading documents...</div>;

    const offerLetter = documents.find(d => d.documentType === 'Offer Letter');
    const candidateUploadedDocs = documents.filter(doc => doc.documentType !== 'Offer Letter');

    return (
        <div className="dashboard-layout">
            {renderSidebar()}

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Document Management</h1>
                        <p>Manage application documents and verification</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-action outline" onClick={handleBackClick}>
                            <FiArrowLeft /> Back
                        </button>
                    </div>
                </header>

                <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                    {error && <div className="error-screen" style={{height: 'auto', padding: '1rem'}}>{error}</div>}

                    {userRole === 'Candidate' && (
                        <div className="content-card">
                            <div className="card-header">
                                <h2>Upload Documents</h2>
                            </div>
                            <div className="card-body">
                                <p className="text-muted" style={{marginBottom: '1rem'}}>Please upload the required documents.</p>
                                <form onSubmit={(e) => handleFileUpload(e, null)} className="upload-form-row">
                                    <div className="form-group" style={{marginBottom: 0, flex: 1}}>
                                        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={{height: '42px'}}>
                                            <option value="CV">CV</option>
                                            <option value="Degree">Degree</option>
                                            <option value="ID Proof">ID Proof</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{marginBottom: 0, flex: 2}}>
                                        <input type="file" onChange={(e) => setFile(e.target.files[0])} required style={{padding: '0.5rem'}} />
                                    </div>
                                    <button type="submit" className="btn-action primary"><FiUploadCloud /> Upload</button>
                                </form>
                                {uploadError && <p className="error-message">{uploadError}</p>}
                                {offerLetter && (
                                    <div className="offer-letter-box">
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                            <FiCheckCircle size={24} color="#166534" />
                                            <div><h4>Congratulations!</h4><p>An offer letter has been uploaded for you.</p></div>
                                        </div>
                                        <a href={`http://localhost:5256/${offerLetter.filePath}`} target="_blank" rel="noopener noreferrer" className="btn-action secondary"><FiDownload /> Download Offer Letter</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="content-card">
                        <div className="card-header">
                            <h2>Uploaded Documents</h2>
                            <span className="badge">{candidateUploadedDocs.length} Files</span>
                        </div>
                        <div className="card-body">
                            {candidateUploadedDocs.length > 0 ? (
                                <div className="table-container">
                                    <table className="dashboard-table">
                                        <thead>
                                        <tr><th>Type</th><th>Uploaded By</th><th>Date</th><th>Status</th><th>Action</th></tr>
                                        </thead>
                                        <tbody>
                                        {candidateUploadedDocs.map(doc => (
                                            <tr key={doc.documentId}>
                                                <td><div className="job-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><FiFileText className="text-muted" /> {doc.documentType}</div></td>
                                                <td>{doc.uploaderName}</td>
                                                <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                                <td><span className={`status-pill status-${doc.verificationStatus.toLowerCase()}`}>{doc.verificationStatus}</span></td>
                                                <td>
                                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                                        <a href={`http://localhost:5256/${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="btn-action outline small">View</a>
                                                        {userRole !== 'Candidate' && doc.verificationStatus === 'Pending' && (
                                                            <>
                                                                <button onClick={() => handleDocumentAction(doc.documentId, 'verify')} className="btn-action primary small" style={{backgroundColor: '#10b981'}}>Verify</button>
                                                                <button onClick={() => handleDocumentAction(doc.documentId, 'reject')} className="btn-action primary small" style={{backgroundColor: '#ef4444'}}>Reject</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (<div className="empty-state">No documents uploaded yet.</div>)}
                        </div>
                    </div>

                    {userRole !== 'Candidate' && (
                        <div className="content-card">
                            <div className="card-header"><h2>Final Selection & Offer</h2></div>
                            <div className="card-body">
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                                    <div>
                                        <h4 style={{marginBottom: '1rem', color: '#374151'}}>1. Upload Offer Letter</h4>
                                        <form onSubmit={(e) => handleFileUpload(e, 'Offer Letter')} className="upload-form-row" style={{flexDirection: 'column', alignItems: 'stretch'}}>
                                            <input type="file" onChange={(e) => setFile(e.target.files[0])} required style={{padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginBottom: '0.5rem'}} />
                                            <button type="submit" className="btn-action primary" style={{justifyContent: 'center'}}><FiUploadCloud /> Upload Letter</button>
                                        </form>
                                        {offerLetter && <p className="success-message" style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>✅ Offer letter uploaded</p>}
                                    </div>
                                    <div>
                                        <h4 style={{marginBottom: '1rem', color: '#374151'}}>2. Finalize Hiring</h4>
                                        <form onSubmit={handleFinalizeSelection} className="upload-form-row" style={{flexDirection: 'column', alignItems: 'stretch'}}>
                                            <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required style={{padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginBottom: '0.5rem'}} />
                                            <button type="submit" className="btn-action primary" style={{backgroundColor: '#166534', justifyContent: 'center'}}><FiCheckCircle /> Mark as Hired</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default DocumentManagementPage;