import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import Sidebar from '../common/Sidebar';
import '../recruiter/RecruiterDashboard.css';

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:5256/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data.data);
            setFilteredUsers(response.data.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();

        const results = users.filter(user => {
            // Handle API field casing variations safely
            const firstName = user.first_name || user.firstName || '';
            const lastName = user.last_name || user.lastName || '';
            const email = user.email || '';
            const role = user.role || user.Role || '';

            // 1. Role Filter
            const matchesRole = selectedRole === 'All' || role.toLowerCase() === selectedRole.toLowerCase();

            // 2. Search Filter
            const matchesSearch = (
                firstName.toLowerCase().includes(lowerSearch) ||
                lastName.toLowerCase().includes(lowerSearch) ||
                email.toLowerCase().includes(lowerSearch) ||
                role.toLowerCase().includes(lowerSearch)
            );

            return matchesRole && matchesSearch;
        });
        setFilteredUsers(results);
    }, [searchTerm, selectedRole, users]);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5256/api/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchUsers(); // Refresh list
        } catch (err) {
            alert("Failed to delete user.");
        }
    };

    const roles = ['All', 'Recruiter', 'Candidate', 'Interviewer', 'Reviewer', 'HR', 'Admin'];

    return (
        <div className="dashboard-layout">
            <Sidebar role="Admin" activeItem="users" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>User Management</h1>
                        <p>Manage system access, roles, and user accounts</p>
                    </div>
                </header>

                <div className="content-card full-width">
                    <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start', paddingBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <h2>System Users</h2>
                            <div className="search-container">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Role Filter Tabs */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 600, marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <FiFilter /> Filter by Role:
                            </span>
                            {roles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '2rem',
                                        border: selectedRole === role ? '1px solid #3A7A58' : '1px solid #E5E7EB',
                                        backgroundColor: selectedRole === role ? '#F0FDF4' : '#FFFFFF',
                                        color: selectedRole === role ? '#166534' : '#4B5563',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card-body">
                        {loading ? <div className="loading-state">Loading users...</div> : (
                            filteredUsers.length > 0 ? (
                                <table className="dashboard-table">
                                    <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Email Address</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredUsers.map(user => {
                                        const roleName = user.role || user.Role || 'Unknown';
                                        const userId = user.user_id || user.userId;
                                        const firstName = user.first_name || user.firstName || '';
                                        const lastName = user.last_name || user.lastName || '';

                                        return (
                                            <tr key={userId}>
                                                <td>
                                                    <div className="candidate-info">
                                                        <div>
                                                            <h4 style={{ margin: 0, color: '#111827' }}>{firstName} {lastName}</h4>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{user.email}</span></td>
                                                <td>
                                                        <span className={`status-pill status-${roleName.toLowerCase().replace(' ', '-')}`}>
                                                            {roleName}
                                                        </span>
                                                </td>
                                                <td>
                                                    {roleName !== 'Admin' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(userId)}
                                                            className="btn-action outline small"
                                                            style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                                            title="Delete User"
                                                        >
                                                            <FiTrash2 /> Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    No users found matching "{searchTerm}" {selectedRole !== 'All' ? `in role ${selectedRole}` : ''}.
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminUserManagement;