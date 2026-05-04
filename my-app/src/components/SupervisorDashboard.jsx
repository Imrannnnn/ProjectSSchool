import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextCore';
import axios from 'axios';
import { FileText, CheckCircle, XCircle, AlertTriangle, Activity, MoreVertical, Search, PieChart, Calendar, TrendingUp } from 'lucide-react';

const SupervisorDashboard = () => {
    const { user, socket } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [comment, setComment] = useState('');

    const fetchStudents = useCallback(async () => {
        try {
            const res = await axios.get(API_BASE_URL + '/api/projects/assigned');
            setStudents(res.data);
        } catch (error) {
            console.error('Fetch Students error:', error);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        if (socket) {
            socket.on('project_submitted', () => fetchStudents());
            socket.on('student_assigned', () => fetchStudents());
            socket.on('project_status_updated', () => fetchStudents());
            return () => {
                socket.off('project_submitted');
                socket.off('student_assigned');
                socket.off('project_status_updated');
            }
        }
    }, [socket, fetchStudents]);

    const handleReview = async (status, selectedTopicIndex = undefined) => {
        if (!selectedStudent) return;
        try {
            const res = await axios.put(`${API_BASE_URL}/api/projects/${selectedStudent._id}/review`, 
                { status, selectedTopicIndex, comment }
            );
            setStudents(prev => prev.map(s => s._id === res.data._id ? res.data : s));
            setSelectedStudent(res.data);
            setComment('');
            alert(`Topic ${status === 'approved_by_supervisor' ? 'Approved' : 'Status Updated'}`);
        } catch (error) {
            console.error(error);
        }
    };

    const stats = {
        total: students.length,
        pending: students.filter(s => s.topicStatus === 'pending').length,
        approved: students.filter(s => s.topicStatus === 'approved_by_supervisor' || s.topicStatus === 'approved').length,
        submissions: students.filter(s => s.topicStatus !== 'none').length
    };

    return (
        <div className="supervisor-dashboard">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Supervisor Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Welcome, {user.name}. You have {stats.pending} topics awaiting review.</p>
            </div>

            <div className="stat-card-row">
                <div className="stat-card success-top">
                    <div className="stat-title">My Students <FileText size={16} /></div>
                    <div className="stat-value">{stats.total}</div>
                </div>
                <div className="stat-card warning-top">
                    <div className="stat-title">Pending Reviews <AlertTriangle size={16} /></div>
                    <div className="stat-value">{stats.pending}</div>
                </div>
                <div className="stat-card success-top">
                    <div className="stat-title">Approved Topics <CheckCircle size={16} /></div>
                    <div className="stat-value">{stats.approved}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Batch Progress <Activity size={16} /></div>
                    <div className="stat-value">{stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</div>
                </div>
            </div>

            <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PieChart size={18} /> Student Analytics</h3>
                    <div className="grid-cols-2" style={{ gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SUBMISSION RATE</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.submissions} / {stats.total}</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>REVISION NEEDED</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{students.filter(s => s.topicStatus === 'correction').length}</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} /> Milestones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: '#eff6ff', color: 'var(--accent-color)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>MAY 15</div>
                            <div style={{ fontSize: '0.875rem' }}>Topic Submission Deadline</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="topic-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Status</th>
                            <th>Topic</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s._id} onClick={() => setSelectedStudent(s)} className={selectedStudent?._id === s._id ? 'active' : ''} style={{ cursor: 'pointer' }}>
                                <td>{s.name}</td>
                                <td><span className={`badge ${s.topicStatus === 'approved' ? 'badge-approved' : 'badge-warning'}`}>{s.topicStatus.toUpperCase()}</span></td>
                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {s.approvedTopic?.title || (s.proposedTopics?.length > 0 ? 'Pending Selection' : 'No Submission')}
                                </td>
                                <td><MoreVertical size={16} /></td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No students assigned yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedStudent && (
                <div className="card" style={{ marginTop: '2rem', borderTop: '4px solid var(--accent-color)' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Review Proposals: {selectedStudent.name}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Review the submitted topics and provide feedback below.</p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>SUPERVISOR FEEDBACK / COMMENTS</label>
                        <textarea 
                            className="input-field" 
                            style={{ minHeight: '100px', background: '#f8fafc' }} 
                            placeholder="Provide advice, requested changes, or praise for these topics..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {selectedStudent.proposedTopics?.map((topic, idx) => (
                            <div key={idx} style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'white' }}>
                                <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>TOPIC OPTION {idx + 1}</div>
                                    <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => handleReview('approved_by_supervisor', idx)}>Approve This Topic</button>
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{topic.title}</h4>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{topic.description}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <button className="btn btn-outline" style={{ flex: 1, minWidth: '200px' }} onClick={() => handleReview('correction')}>Request Refinement / New Topics</button>
                        <button className="btn btn-outline" style={{ border: 'none', color: 'var(--danger)', flex: 1 }} onClick={() => handleReview('none')}>Reject All</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorDashboard;
