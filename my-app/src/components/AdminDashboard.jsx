import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextCore';
import axios from 'axios';
import { Shield, Users, Clock, CheckCircle2, XCircle, Search, UserCheck, FileText, AlertCircle, Save } from 'lucide-react';

const AdminDashboard = () => {
    const { socket } = useAuth();
    const [queue, setQueue] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [stats, setStats] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [queueRes, statsRes] = await Promise.all([
                axios.get(API_BASE_URL + '/api/projects/admin/queue'),
                axios.get(API_BASE_URL + '/api/users/admin/stats')
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
    }, [socket]);

    const handleApproval = async (status) => {
        if (!selectedStudent) return;
        try {
            const res = await axios.put(`${API_BASE_URL}/api/projects/${selectedStudent._id}/admin-approval`, { status });
            setQueue(prev => prev.map(s => s._id === res.data._id ? res.data : s));
            setSelectedStudent(res.data);
            alert(`Topic ${status === 'approved' ? 'Officially Approved' : 'Rejected'}`);
        } catch (error) {
            console.error(error);
        }
    };

    const runBatchCheck = async () => {
        if (queue.length === 0) return;
        if (!window.confirm(`Are you sure you want to run an automatic duplicate check on all ${queue.length} pending projects? Passing topics will be automatically approved.`)) return;
        
        setIsChecking(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/projects/admin/batch-check`);
            alert(res.data.message);
            fetchDashboardData();
            setSelectedStudent(null);
        } catch (error) {
            console.error(error);
            alert('Error during batch duplicate check');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Project Committee Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Final verification and system oversight.</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={runBatchCheck} 
                    disabled={isChecking || queue.length === 0}
                    style={{ background: 'var(--accent-color)', gap: '0.5rem', opacity: (isChecking || queue.length === 0) ? 0.6 : 1 }}
                >
                    {isChecking ? 'Checking...' : <><Search size={18} /> Check Duplicates</>}
                </button>
            </div>

            <div className="stat-card-row">
                <div className="stat-card success-top">
                    <div className="stat-title">Total Students <Users size={16} /></div>
                    <div className="stat-value">{stats?.totals.students || '0'}</div>
                </div>
                <div className="stat-card warning-top">
                    <div className="stat-title">Topic Queue <Clock size={16} /></div>
                    <div className="stat-value">{queue.length}</div>
                </div>
                <div className="stat-card success-top">
                    <div className="stat-title">Approved Topics <CheckCircle2 size={16} /></div>
                    <div className="stat-value">{stats?.totals.approvedProjects || '0'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Supervisors <Shield size={16} /></div>
                    <div className="stat-value">{stats?.totals.supervisors || '0'}</div>
                </div>
            </div>
            
            {stats?.departmentStats && stats.departmentStats.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={22} style={{ color: 'var(--accent-color)' }} /> Department Enrollment & Progress Oversight
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {stats.departmentStats.map((dept, idx) => {
                            const registeredPercentage = dept.capacity > 0 ? Math.min(100, Math.round((dept.registeredCount / dept.capacity) * 100)) : 0;
                            const isAtCapacity = dept.registeredCount >= dept.capacity;

                            return (
                                <div key={idx} className="card animate-fade-in" style={{ 
                                    borderTop: isAtCapacity ? '4px solid var(--danger)' : '4px solid var(--accent-color)', 
                                    padding: '1.5rem', 
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.25rem'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{dept.name}</h4>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Prefix: {dept.prefix}</span>
                                            </div>
                                            <span className={`badge ${isAtCapacity ? 'badge-danger' : 'badge-approved'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                                                {isAtCapacity ? 'CAPACITY FULL' : 'ACTIVE'}
                                            </span>
                                        </div>

                                        {/* Capacity Config quick input */}
                                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} /> Capacity Limit:</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input 
                                                    type="number"
                                                    id={`capacity-input-${dept._id}`}
                                                    defaultValue={dept.capacity}
                                                    style={{ width: '65px', padding: '0.25rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                                                />
                                                <button 
                                                    className="btn btn-outline" 
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto', margin: 0, minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'white' }}
                                                    onClick={async () => {
                                                        const input = document.getElementById(`capacity-input-${dept._id}`);
                                                        const newCap = parseInt(input.value, 10);
                                                        if (isNaN(newCap) || newCap < 0) {
                                                            alert('Please enter a valid capacity.');
                                                            return;
                                                        }
                                                        try {
                                                            await axios.put(`${API_BASE_URL}/api/departments/${dept._id}`, { capacity: newCap });
                                                            alert(`Successfully updated capacity for ${dept.name} to ${newCap}!`);
                                                            fetchDashboardData();
                                                        } catch (error) {
                                                            console.error(error);
                                                            alert('Failed to update capacity.');
                                                        }
                                                    }}
                                                >
                                                    <Save size={12} /> Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fill rate progress bar */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Enrollment Fill Rate</span>
                                            <span style={{ fontWeight: 700, color: isAtCapacity ? 'var(--danger)' : 'var(--accent-color)' }}>{registeredPercentage}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${registeredPercentage}%`, 
                                                background: isAtCapacity ? 'var(--danger)' : 'var(--success)', 
                                                borderRadius: '4px',
                                                transition: 'width 0.4s ease'
                                            }}></div>
                                        </div>
                                    </div>

                                    {/* Detailed breakdown metrics grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> REGISTERED</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                                                {dept.registeredCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>/ {dept.capacity}</span>
                                            </div>
                                        </div>
                                        
                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #10b981', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><UserCheck size={12} /> ASSIGNED</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{dept.assignedCount}</div>
                                        </div>

                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #8b5cf6', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={12} /> SUBMITTED</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{dept.submittedCount}</div>
                                        </div>

                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12} /> PENDING SUB.</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{dept.notSubmittedCount}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="stat-card-row" style={{ gridTemplateColumns: 'minmax(0, 2fr) 1fr', alignItems: 'start' }}>
                <div>
                    <div className="table-container">
                        <div className="table-header">
                            <span>Pending Final Verification</span>
                        </div>
                        <table className="topic-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Approved Topic</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.map(s => (
                                    <tr key={s._id} onClick={() => setSelectedStudent(s)} className={selectedStudent?._id === s._id ? 'active' : ''} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{s.identifier}</div>
                                        </td>
                                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {s.approvedTopic?.title || 'No Title'}
                                        </td>
                                        <td>
                                            <span className={`badge ${s.topicStatus === 'approved' ? 'badge-approved' : 'badge-warning'}`}>
                                                {s.topicStatus === 'approved_by_supervisor' ? 'AWAITING' : s.topicStatus.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {queue.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>The queue is currently empty.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="card" style={{ position: 'sticky', top: '1rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Final Decision</h3>
                    {selectedStudent ? (
                        <>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>TOPIC TO APPROVE</div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', lineHeight: 1.4 }}>{selectedStudent.approvedTopic?.title}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>{selectedStudent.approvedTopic?.description}</p>
                                
                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                        <span style={{ color: '#64748b' }}>Account Created:</span>
                                        <span style={{ fontWeight: 600 }}>{selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleString() : 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                        <span style={{ color: '#64748b' }}>Academic Session:</span>
                                        <span style={{ fontWeight: 600 }}>{selectedStudent.academicSession || 'Not Set'}</span>
                                    </div>
                                    {selectedStudent.topicSubmittedAt && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                            <span style={{ color: '#64748b' }}>Submitted At:</span>
                                            <span style={{ fontWeight: 600 }}>{new Date(selectedStudent.topicSubmittedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedStudent.topicReviewedAt && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                            <span style={{ color: '#64748b' }}>Reviewed At:</span>
                                            <span style={{ fontWeight: 600 }}>{new Date(selectedStudent.topicReviewedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedStudent.topicApprovedAt && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                            <span style={{ color: '#64748b' }}>Approved At:</span>
                                            <span style={{ fontWeight: 600 }}>{new Date(selectedStudent.topicApprovedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedStudent.lastDuplicationCheckAt && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                            <span style={{ color: '#64748b' }}>Last Dup Check:</span>
                                            <span style={{ fontWeight: 600 }}>{new Date(selectedStudent.lastDuplicationCheckAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleApproval('approved')}>Confirm Approval</button>
                                <button className="btn btn-outline" style={{ width: '100%', color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.2)' }} onClick={() => handleApproval('correction')}>Reject to Supervisor</button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <Search size={32} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select a student from the queue to verify their topic.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
