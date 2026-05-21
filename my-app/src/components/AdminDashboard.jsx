import API_BASE_URL from '../apiConfig';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContextCore';
import axios from 'axios';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Save,
    Search,
    Shield,
    UserCheck,
    Users
} from 'lucide-react';

const formatStatusLabel = (status) => {
    if (status === 'approved_by_supervisor') return 'Awaiting Admin';
    if (status === 'approved') return 'Verified';
    return status?.replaceAll('_', ' ').toUpperCase() || 'UNKNOWN';
};

const getStatusBadgeClass = (status) => {
    if (status === 'approved') return 'badge-approved';
    if (status === 'approved_by_supervisor') return 'badge-warning';
    return 'badge-pending';
};

const getTopicPreview = (student) => {
    return student?.approvedTopic?.title || 'No Title';
};

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

            const incomingQueue = queueRes.data || [];
            setQueue(incomingQueue);
            setStats(statsRes.data);

            setSelectedStudent((current) => {
                if (!current) return null;
                const refreshedStudent = incomingQueue.find((student) => student._id === current._id);
                return refreshedStudent || null;
            });
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
            const updatedStudent = res.data;

            setQueue((prev) => prev.map((student) => student._id === updatedStudent._id ? updatedStudent : student));
            setSelectedStudent(updatedStudent.topicStatus === 'approved_by_supervisor' ? updatedStudent : null);
            alert(`Topic ${status === 'approved' ? 'Officially Approved' : 'Rejected'}`);
            fetchDashboardData();
        } catch (error) {
            console.error(error);
        }
    };

    const runBatchCheck = async () => {
        const pendingQueue = queue.filter((student) => student.topicStatus === 'approved_by_supervisor');
        if (pendingQueue.length === 0) return;
        if (!window.confirm(`Are you sure you want to run an automatic duplicate check on all ${pendingQueue.length} pending projects? Passing topics will be automatically approved.`)) return;

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

    const pendingQueue = queue.filter((student) => student.topicStatus === 'approved_by_supervisor');
    const verifiedStudents = queue.filter((student) => student.topicStatus === 'approved');
    const visibleSelectedStudent = selectedStudent?.topicStatus === 'approved_by_supervisor' ? selectedStudent : null;
    const completionRate = stats?.totals?.students ? Math.round(((stats?.totals?.approvedProjects || 0) / stats.totals.students) * 100) : 0;

    return (
        <div className="admin-dashboard">
            <div
                className="card"
                style={{
                    marginBottom: '2rem',
                    padding: '1.75rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 55%, #eef5ff 100%)',
                    border: '1px solid rgba(15, 98, 254, 0.12)',
                    boxShadow: '0 18px 40px -28px rgba(15, 98, 254, 0.45)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: '720px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                padding: '0.35rem 0.7rem',
                                borderRadius: '999px',
                                background: 'rgba(15, 98, 254, 0.08)',
                                color: 'var(--accent-color)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                marginBottom: '1rem'
                            }}
                        >
                            <Shield size={14} /> Admin Control Center
                        </div>
                        <h2 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                            Project verification, approvals, and academic oversight
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                            Review supervisor-approved topics, confirm final approvals, and track verified students across each department from one organized workspace.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div
                            style={{
                                minWidth: '180px',
                                padding: '0.9rem 1rem',
                                borderRadius: '14px',
                                background: 'rgba(255, 255, 255, 0.88)',
                                border: '1px solid rgba(15, 23, 42, 0.08)'
                            }}
                        >
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Verified Coverage
                            </div>
                            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)' }}>{completionRate}%</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>of registered students fully approved</div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={runBatchCheck}
                            disabled={isChecking || pendingQueue.length === 0}
                            style={{ gap: '0.5rem', opacity: (isChecking || pendingQueue.length === 0) ? 0.6 : 1, minHeight: '48px' }}
                        >
                            {isChecking ? 'Checking...' : <><Search size={18} /> Check Pending Topics</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="stat-card-row">
                <div className="stat-card success-top">
                    <div className="stat-title">Total Students <Users size={16} /></div>
                    <div className="stat-value">{stats?.totals.students || '0'}</div>
                    <div className="stat-subtitle gray">Registered across all departments</div>
                </div>
                <div className="stat-card warning-top">
                    <div className="stat-title">Pending Verification <Clock size={16} /></div>
                    <div className="stat-value">{pendingQueue.length}</div>
                    <div className="stat-subtitle gray">Supervisor-approved topics awaiting admin sign-off</div>
                </div>
                <div className="stat-card success-top">
                    <div className="stat-title">Verified Students <CheckCircle2 size={16} /></div>
                    <div className="stat-value">{verifiedStudents.length}</div>
                    <div className="stat-subtitle">Final approvals completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Supervisors <Shield size={16} /></div>
                    <div className="stat-value">{stats?.totals.supervisors || '0'}</div>
                    <div className="stat-subtitle gray">Active faculty accounts</div>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <div className="card" style={{ padding: '1.1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Review Queue Health
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>{pendingQueue.length === 0 ? 'Clear' : 'Needs Attention'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {pendingQueue.length === 0 ? 'No topics are waiting for final verification.' : `${pendingQueue.length} student topic${pendingQueue.length > 1 ? 's are' : ' is'} waiting for admin review.`}
                    </div>
                </div>
                <div className="card" style={{ padding: '1.1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Approved Repository
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>{stats?.totals.approvedProjects || 0}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Topics already committed to the official project archive.
                    </div>
                </div>
                <div className="card" style={{ padding: '1.1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Review Focus
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                        {visibleSelectedStudent ? visibleSelectedStudent.identifier : 'No Student Selected'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {visibleSelectedStudent ? getTopicPreview(visibleSelectedStudent) : 'Choose a pending student to inspect their approved topic details.'}
                    </div>
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
                                <div
                                    key={idx}
                                    className="card animate-fade-in"
                                    style={{
                                        borderTop: isAtCapacity ? '4px solid var(--danger)' : '4px solid var(--accent-color)',
                                        padding: '1.5rem',
                                        background: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.25rem'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{dept.name}</h4>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Prefix: {dept.prefix}</span>
                                            </div>
                                            <span className={`badge ${isAtCapacity ? 'badge-rejected' : 'badge-approved'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                                                {isAtCapacity ? 'Capacity Full' : 'Active'}
                                            </span>
                                        </div>

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

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Enrollment Fill Rate</span>
                                            <span style={{ fontWeight: 700, color: isAtCapacity ? 'var(--danger)' : 'var(--accent-color)' }}>{registeredPercentage}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${registeredPercentage}%`,
                                                    background: isAtCapacity ? 'var(--danger)' : 'var(--success)',
                                                    borderRadius: '4px',
                                                    transition: 'width 0.4s ease'
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> Registered</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                                                {dept.registeredCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>/ {dept.capacity}</span>
                                            </div>
                                        </div>

                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #10b981', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><UserCheck size={12} /> Assigned</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{dept.assignedCount}</div>
                                        </div>

                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #8b5cf6', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={12} /> Submitted</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{dept.submittedCount}</div>
                                        </div>

                                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12} /> Pending Sub.</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{dept.notSubmittedCount}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="stat-card-row" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="table-container" style={{ marginBottom: 0 }}>
                        <div className="table-header">
                            <span>Pending Final Verification</span>
                            <span className="badge badge-warning">{pendingQueue.length} waiting</span>
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
                                {pendingQueue.map((student) => (
                                    <tr key={student._id} onClick={() => setSelectedStudent(student)} className={visibleSelectedStudent?._id === student._id ? 'active' : ''} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{student.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{student.identifier}</div>
                                        </td>
                                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {getTopicPreview(student)}
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(student.topicStatus)}`}>
                                                {formatStatusLabel(student.topicStatus)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {pendingQueue.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            No students are waiting for final verification.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-container" style={{ marginBottom: 0 }}>
                        <div className="table-header">
                            <span>Verified Students</span>
                            <span className="badge badge-approved">{verifiedStudents.length} verified</span>
                        </div>
                        <table className="topic-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Verified Topic</th>
                                    <th>Approved On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {verifiedStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{student.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{student.identifier}</div>
                                        </td>
                                        <td style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {getTopicPreview(student)}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="badge badge-approved">Verified</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                                    {student.topicApprovedAt ? new Date(student.topicApprovedAt).toLocaleString() : 'Recently approved'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {verifiedStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            No fully verified students yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div
                    className="card"
                    style={{
                        position: 'sticky',
                        top: '1rem',
                        borderTop: visibleSelectedStudent ? '4px solid var(--accent-color)' : '4px solid #cbd5e1',
                        boxShadow: '0 14px 34px -26px rgba(15, 23, 42, 0.35)'
                    }}
                >
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
                            Final Decision Panel
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Admin Approval Review</h3>
                    </div>

                    {visibleSelectedStudent ? (
                        <>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            Topic To Verify
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.45 }}>{visibleSelectedStudent.approvedTopic?.title}</h4>
                                    </div>
                                    <span className={`badge ${getStatusBadgeClass(visibleSelectedStudent.topicStatus)}`}>
                                        {formatStatusLabel(visibleSelectedStudent.topicStatus)}
                                    </span>
                                </div>

                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                                    {visibleSelectedStudent.approvedTopic?.description}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Student</div>
                                        <div style={{ fontWeight: 700 }}>{visibleSelectedStudent.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{visibleSelectedStudent.identifier}</div>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Academic Session</div>
                                        <div style={{ fontWeight: 700 }}>{visibleSelectedStudent.academicSession || 'Not Set'}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Current student record</div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '1rem' }}>
                                        <span style={{ color: '#64748b' }}>Account Created</span>
                                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{visibleSelectedStudent.createdAt ? new Date(visibleSelectedStudent.createdAt).toLocaleString() : 'N/A'}</span>
                                    </div>
                                    {visibleSelectedStudent.topicSubmittedAt && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '1rem' }}>
                                            <span style={{ color: '#64748b' }}>Submitted At</span>
                                            <span style={{ fontWeight: 600, textAlign: 'right' }}>{new Date(visibleSelectedStudent.topicSubmittedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {visibleSelectedStudent.topicReviewedAt && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '1rem' }}>
                                            <span style={{ color: '#64748b' }}>Supervisor Reviewed</span>
                                            <span style={{ fontWeight: 600, textAlign: 'right' }}>{new Date(visibleSelectedStudent.topicReviewedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {visibleSelectedStudent.lastDuplicationCheckAt && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '1rem' }}>
                                            <span style={{ color: '#64748b' }}>Last Duplicate Check</span>
                                            <span style={{ fontWeight: 600, textAlign: 'right' }}>{new Date(visibleSelectedStudent.lastDuplicationCheckAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button className="btn btn-primary" style={{ width: '100%', minHeight: '46px' }} onClick={() => handleApproval('approved')}>
                                    Confirm Final Approval
                                </button>
                                <button className="btn btn-outline" style={{ width: '100%', color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.2)', minHeight: '46px' }} onClick={() => handleApproval('correction')}>
                                    Return To Supervisor
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem' }}>
                            <Search size={34} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                            <div style={{ fontWeight: 700, marginBottom: '0.45rem' }}>No pending student selected</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
                                Pick a student from the Pending Final Verification table to inspect the approved topic and complete the final decision.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
