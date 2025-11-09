import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './DocumentManagementPage.css';

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

        if (!fileToUpload) {
            setUploadError('Please select a file.');
            return;
        }

        const formData = new FormData();
        const token = getToken();
        setUploadError('');

        let url = `http://localhost:5256/api/applications/${applicationId}/documents`;

        if(docType === 'Offer Letter') {

            url = `http://localhost:5256/api/applications/${applicationId}/documents/offer-letter`;
            formData.append('file', fileToUpload);
        } else {
            formData.append('File', fileToUpload);
            formData.append('DocumentType', finalDocType);
        }

        try {
            await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setFile(null);
            if (e.target) {
                e.target.reset();
            }
            fetchDocuments();
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Upload failed.');
        }
    };

    const handleDocumentAction = async (docId, action) => {
        const token = getToken();
        const url = `http://localhost:5256/api/hr/documents/${docId}/${action}`;
        try {
            await axios.put(url, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDocuments(); // Refresh list
        } catch (err) {
            alert(`Failed to ${action} document.`);
        }
    };
    const handleFinalizeSelection = async (e) => {
        e.preventDefault();
        const token = getToken();
        try {
            await axios.put(`http://localhost:5256/api/hr/applications/${applicationId}/select`,
                { joiningDate },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert('Candidate marked as Hired!');
            fetchDocuments();
        } catch (err) {
            alert('Failed to finalize selection.');
        }
    };

    if (loading) return <div>Loading documents...</div>;

    const offerLetter = documents.find(d => d.documentType === 'Offer Letter');
    const candidateUploadedDocs = documents.filter(doc => doc.documentType !== 'Offer Letter');

    const getDashboardLink = () => {
        switch(userRole) {
            case 'Candidate': return '/candidate-dashboard';
            case 'Recruiter': return '/recruiter-dashboard';
            case 'HR': return '/hr-dashboard';
            default: return '/login';
        }
    };

    return (
        <div className="doc-management-container">
            <header className="doc-header">
                <h1>Document Management</h1>
                <Link to={getDashboardLink()}>Back to Dashboard</Link>
            </header>

            {error && <p className="error-message">{error}</p>}

            {userRole === 'Candidate' && (
                <div className="doc-section candidate-upload">
                    <h3>Upload Your Documents</h3>
                    <p>Please upload the required documents for your application.</p>
                    <form onSubmit={(e) => handleFileUpload(e, null)} className="upload-form">
                        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                            <option value="CV">CV</option>
                            <option value="Degree">Degree</option>
                            <option value="ID Proof">ID Proof</option>
                        </select>
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                        <button type="submit">Upload</button>
                    </form>
                    {uploadError && <p className="error-message">{uploadError}</p>}

                    <div className="doc-list-section">
                        <h4>Your Uploaded Documents</h4>
                        {candidateUploadedDocs.length > 0 ? (
                            <div className="doc-list">
                                {candidateUploadedDocs.map(doc => (
                                    <DocumentRow key={doc.documentId} doc={doc} userRole={userRole} onVerify={() => {}} onReject={() => {}} />
                                ))}
                            </div>
                        ) : (<p>You have not uploaded any documents yet.</p>)}
                    </div>

                    {offerLetter && (
                        <div className="offer-letter-download">
                            <h4>Congratulations!</h4>
                            <p>An offer letter has been uploaded for you.</p>
                            <a href={`http://localhost:5256/${offerLetter.filePath}`} target="_blank" rel="noopener noreferrer" className="doc-btn verify">Download Offer Letter</a>
                        </div>
                    )}
                </div>
            )}

            {userRole !== 'Candidate' && (
                <div className="doc-section hr-actions">
                    <h3>Review Documents</h3>
                    {documents.length === 0 && <p>Candidate has not uploaded any documents yet.</p>}
                    <div className="doc-list">
                        {documents.map(doc => (
                            <DocumentRow
                                key={doc.documentId}
                                doc={doc}
                                userRole={userRole}
                                onVerify={handleDocumentAction.bind(null, doc.documentId, 'verify')}
                                onReject={handleDocumentAction.bind(null, doc.documentId, 'reject')}
                            />
                        ))}
                    </div>

                    <div className="hr-finalize-section">
                        <h4>Final Selection</h4>
                        <form onSubmit={(e) => handleFileUpload(e, 'Offer Letter')} className="upload-form">
                            <label>Upload Offer Letter</label>
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                            <button type="submit">Upload</button>
                        </form>
                        <form onSubmit={handleFinalizeSelection} className="upload-form">
                            <label>Set Joining Date</label>
                            <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
                            <button type="submit">Mark as Hired</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentManagementPage;