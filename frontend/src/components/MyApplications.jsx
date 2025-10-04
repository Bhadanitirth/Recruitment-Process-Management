import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5256/api/candidate/my-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setApplications(response.data.data || []);
            } catch (err) {
                setError('Could not load your applications.');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) return <p>Loading your applications...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="applications-container">
            <h2>My Application Status</h2>
            {applications.length > 0 ? (
                <table className="applications-table">
                    <thead>
                    <tr>
                        <th>Job Title</th>
                        <th>Status</th>
                        <th>Applied On</th>
                    </tr>
                    </thead>
                    <tbody>
                    {applications.map(app => (
                        <tr key={app.applicationId}>
                            <td>{app.jobTitle}</td>
                            <td><span className={`status-badge status-${app.applicationStatus.toLowerCase()}`}>{app.applicationStatus}</span></td>
                            <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : <p>You have not been linked to any jobs yet.</p>}
        </div>
    );
}

export default MyApplications;
