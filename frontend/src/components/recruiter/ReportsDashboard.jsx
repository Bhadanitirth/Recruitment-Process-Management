import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { FiUsers, FiBriefcase, FiGrid, FiCheckCircle, FiDownload, FiBarChart2, FiLogOut } from 'react-icons/fi';
import './ReportsDashboard.css';
import RecruiterSidebar from './RecruiterSidebar'; // Import sidebar

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function ReportsDashboard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [positionData, setPositionData] = useState([]);
    const [funnelData, setFunnelData] = useState([]);
    const [collegeData, setCollegeData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const headers = { 'Authorization': `Bearer ${token}` };

        const fetchData = async () => {
            try {
                const [sumRes, posRes, funRes, colRes] = await Promise.all([
                    axios.get('http://localhost:5256/api/reports/summary', { headers }),
                    axios.get('http://localhost:5256/api/reports/position-stats', { headers }),
                    axios.get('http://localhost:5256/api/reports/funnel-stats', { headers }),
                    axios.get('http://localhost:5256/api/reports/college-stats', { headers }),
                ]);

                setSummary(sumRes.data.data);
                setPositionData(posRes.data.data);
                setFunnelData(funRes.data.data);
                setCollegeData(colRes.data.data);
            } catch (err) {
                console.error("Error fetching report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const downloadPdf = async (type) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5256/api/reports/download-pdf/${type}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error("Error downloading PDF", err);
            alert("Failed to download PDF.");
        }
    };

    return (
        <div className="dashboard-layout">
            <RecruiterSidebar activePage="reports" />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-title">
                        <h1>Analytics & Reporting</h1>
                        <p>Real-time insights and recruitment performance</p>
                    </div>
                </header>

                {/* --- UI UPDATE: Centered Loading Message --- */}
                {loading || !summary ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 'calc(100vh - 200px)',
                        width: '100%',
                        color: '#6B7280',
                        fontSize: '1.2rem',
                        fontWeight: '500'
                    }}>
                        Loading Analytics...
                    </div>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon candidates-icon"><FiUsers /></div>
                                <div className="stat-info">
                                    <h3>{summary.totalCandidates}</h3>
                                    <p>Total Candidates</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon jobs-icon"><FiBriefcase /></div>
                                <div className="stat-info">
                                    <h3>{summary.totalJobs}</h3>
                                    <p>Active Jobs</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon interviews-icon"><FiGrid /></div>
                                <div className="stat-info">
                                    <h3>{summary.interviewsScheduled}</h3>
                                    <p>Interviews Set</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon hired-icon"><FiCheckCircle /></div>
                                <div className="stat-info">
                                    <h3>{summary.hiredCount}</h3>
                                    <p>Hired Candidates</p>
                                </div>
                            </div>
                        </div>

                        <div className="charts-grid">
                            {/* Position Wise */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3>Applications per Position</h3>
                                    <button className="btn-icon" onClick={() => downloadPdf('position')} title="Download PDF">
                                        <FiDownload /> PDF
                                    </button>
                                </div>
                                <div className="chart-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={positionData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} allowDecimals={false} />
                                            <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                            <Bar dataKey="value" fill="#3A7A58" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Funnel */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3>Candidate Funnel</h3>
                                    <button className="btn-icon" onClick={() => downloadPdf('funnel')} title="Download PDF">
                                        <FiDownload /> PDF
                                    </button>
                                </div>
                                <div className="chart-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={funnelData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                nameKey="label"
                                                label
                                            >
                                                {funnelData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* College Stats */}
                            <div className="chart-card full-width">
                                <div className="chart-header">
                                    <h3>College Distribution</h3>
                                    <button className="btn-icon" onClick={() => downloadPdf('college')} title="Download PDF">
                                        <FiDownload /> PDF
                                    </button>
                                </div>
                                <div className="chart-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={collegeData} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} allowDecimals={false} />
                                            <YAxis dataKey="label" type="category" width={150} axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                            <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                            <Bar dataKey="value" fill="#4ADE80" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default ReportsDashboard;