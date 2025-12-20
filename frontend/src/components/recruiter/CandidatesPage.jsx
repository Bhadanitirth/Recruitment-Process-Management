import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiSearch } from 'react-icons/fi';
import './RecruiterDashboard.css';
import AddCandidateModal from './AddCandidateModal.jsx';
import BulkAddModal from './BulkAddModal';
import Sidebar from "../common/Sidebar.jsx";

function CandidatesPage() {
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Search State
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchCandidates = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const response = await axios.get('http://localhost:5256/api/candidates', { headers });
            setCandidates(response.data.data || []);
            setFilteredCandidates(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch candidates.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const results = candidates.filter(c =>
            c.first_name.toLowerCase().includes(term) ||
            c.last_name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            (c.phone && c.phone.includes(term)) ||
            (c.college_name && c.college_name.toLowerCase().includes(term))
        );
        setFilteredCandidates(results);
    }, [searchTerm, candidates]);

    return (
        <div className="dashboard-layout">
            <Sidebar role="Recruiter" activeItem="candidates" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Candidate Directory</h1>
                        <p>Manage your talent pool</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-action primary" onClick={() => setAddModalOpen(true)}>
                            <FiPlus /> Add Candidate
                        </button>
                        <button className="btn-action outline" onClick={() => setBulkModalOpen(true)}>
                            Bulk Upload
                        </button>
                    </div>
                </header>

                <div className="content-card full-width">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>All Candidates</h2>
                        <div className="search-container">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by name, email, or college..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="card-body">
                        {loading ? <p>Loading candidates...</p> : error ? <p className="error-message">{error}</p> : (
                            filteredCandidates.length > 0 ? (
                                <table className="dashboard-table">
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>College</th>
                                        <th>Joined Date</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredCandidates.map(c => (
                                        <tr key={c.candidate_id}>
                                            <td>
                                                <div className="candidate-item" style={{borderBottom: 'none', padding: 0}}>
                                                    <div className="candidate-avatar">{c.first_name[0]}{c.last_name[0]}</div>
                                                    <div className="candidate-details">
                                                        <h4>{c.first_name} {c.last_name}</h4>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span style={{color: '#6b7280', fontSize: '0.9rem'}}>{c.email}</span></td>
                                            <td><span style={{color: '#6b7280', fontSize: '0.9rem'}}>{c.phone || 'N/A'}</span></td>
                                            <td><span style={{color: '#6b7280', fontSize: '0.9rem'}}>{c.college_name || 'N/A'}</span></td>
                                            <td><span style={{color: '#6b7280', fontSize: '0.9rem'}}>{new Date(c.created_at).toLocaleDateString()}</span></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : <div className="empty-state">No candidates found matching "{searchTerm}".</div>
                        )}
                    </div>
                </div>
            </main>

            <AddCandidateModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onCandidateAdded={fetchCandidates} />
            <BulkAddModal isOpen={isBulkModalOpen} onClose={() => setBulkModalOpen(false)} onCandidatesAdded={fetchCandidates} />
        </div>
    );
}

export default CandidatesPage;