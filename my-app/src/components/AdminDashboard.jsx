import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextCore';
import axios from 'axios';
import { Shield, Users, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';

const AdminDashboard = () => {
    const { user, socket } = useAuth();
    const [queue, setQueue] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [stats, setStats] = useState(null);
    const [comment, setComment] = useState('');

    const fetchDashboardData = async () => {
        try {
            const [queueRes, statsRes] = await Promise.all([
                axios.get(API_BASE_URL + '/api/projects/admin/queue', {
                    headers: { Authorization: `Bearer ${user.token}` }
                }),
                axios.get(API_BASE_URL + '/api/users/admin/stats', {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
            ]);
            setQueue(queueRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        if (socket) {
            socket.on('new_admin_review', () => fetchDashboardData());
            socket.on('project_status_updated', () => fetchDashboardData());
            return () => {
                socket.off('new_admin_review');
                socket.off('project_status_updated');
            };
        }
    }, [socket, user.token]);

    const handleApproval = async (status) => {
        if (!selectedStudent) return;
        try {
            const res = await axios.put(`${API_BASE_URL}/api/projects/${selectedStudent._id}/admin-approval`, 
                { status },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setQueue(prev => prev.map(s => s._id === res.data._id ? res.data : s));
            setSelectedStudent(res.data);
            alert(`Topic ${status === 'approved' ? 'Officially Approved' : 'Rejected'}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Admin Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Final verification and system oversight.</p>
            </div>

            <div className="stat-card-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card success-top">
                    <div className="stat-title">Total Students <Users size={16} /></div>
                    <div className="stat-value">{stats?.totals.students || '...'}</div>
                </div>
                <div className="stat-card warning-top">
                    <div className="stat-title">Topic Queue <Clock size={16} /></div>
                    <div className="stat-value">{queue.length}</div>
                </div>
                <div className="stat-card success-top">
                    <div className="stat-title">Approved Topics <CheckCircle2 size={16} /></div>
                    <div className="stat-value">{stats?.totals.approvedProjects || '...'}</div>
                </div>
                <div className="stat-card info-top">
                    <div className="stat-title">Supervisors <Shield size={16} /></div>
                    <div className="stat-value">{stats?.totals.supervisors || '...'}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 2fr) 1fr', gap: '2rem' }}>
                <div>
                    <div className="table-container">
                        <div className="table-header">
                            <span>Pending Final Verification</span>
                        </div>
                        <table className="topic-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Proposed Approved Topic</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.map(s => (
                                    <tr key={s._id} onClick={() => setSelectedStudent(s)} className={selectedStudent?._id === s._id ? 'active' : ''} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ID: {s.identifier}</div>
                                        </td>
                                        <td>{s.approvedTopic?.title || 'No Title'}</td>
                                        <td>
                                            <span className={`badge ${s.topicStatus === 'approved' ? 'badge-approved' : 'badge-warning'}`}>
                                                {s.topicStatus === 'approved_by_supervisor' ? 'AWAITING ADMIN' : s.topicStatus.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="card">
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Final Decision</h3>
                    {selectedStudent ? (
                        <>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>TOPIC TO APPROVE</div>
                                <h4 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>{selectedStudent.approvedTopic?.title}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedStudent.approvedTopic?.description}</p>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={() => handleApproval('approved')}>Confirm Approval</button>
                            <button className="btn btn-outline" style={{ width: '100%', color: 'var(--danger)' }} onClick={() => handleApproval('correction')}>Reject to Supervisor</button>
                        </>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select a student from the queue to verify their topic.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
