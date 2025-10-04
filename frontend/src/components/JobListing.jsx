import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JobListing() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5256/api/candidate/jobs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setJobs(response.data.data || []);
            } catch (err) {
                setError('Could not load job listings.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) return <p>Loading jobs...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="job-listing-container">
            <h2>Available Positions</h2>
            {jobs.length > 0 ? jobs.map(job => (
                <div key={job.jobId} className="job-card">
                    <h3>{job.title}</h3>
                    <p>{job.description}</p>
                </div>
            )) : <p>No open positions at the moment.</p>}
        </div>
    );
}

export default JobListing;
