import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextCore';
import axios from 'axios';
import { CheckCircle2, User, Inbox, RotateCcw, Activity } from 'lucide-react';

const StudentDashboard = () => {
    const { user, socket } = useAuth();
    const [profile, setProfile] = useState(null);
    const [proposedTopics, setProposedTopics] = useState([
        { title: '', description: '' },
        { title: '', description: '' }
    ]);
    const [loading, setLoading] = useState(true);

    const fetchMyData = async () => {
        try {
            const [projRes, profRes] = await Promise.all([
                axios.get(API_BASE_URL + '/api/projects'),
                axios.get(API_BASE_URL + '/api/users/me')
            ]);
            setProfile(profRes.data);
            if (projRes.data) {
                if (projRes.data.proposedTopics && projRes.data.proposedTopics.length > 0) {
                    setProposedTopics(projRes.data.proposedTopics);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyData();
        if (socket) {
            socket.on('project_status_updated', () => fetchMyData());
            socket.on('supervisor_assigned', () => fetchMyData());
            return () => {
                socket.off('project_status_updated');
                socket.off('supervisor_assigned');
            }
        }
    }, [socket]);

    const handleSubmitProject = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(API_BASE_URL + '/api/projects', { proposedTopics });
            setProfile(res.data);
            alert('Topics submitted successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error submitting topics');
        }
    };

    const handleTopicChange = (index, field, value) => {
        const newTopics = [...proposedTopics];
        newTopics[index] = { ...newTopics[index], [field]: value };
        setProposedTopics(newTopics);
    };

    const addTopicField = () => {
        setProposedTopics([...proposedTopics, { title: '', description: '' }]);
    };

    const clearForm = async () => {
        if (!profile || profile.topicStatus === 'none') {
            setProposedTopics([
                { title: '', description: '' },
                { title: '', description: '' }
            ]);
            return;
        }

        if (!window.confirm("This will permanently delete your current research proposal. Are you sure?")) return;

        try {
            await axios.delete(API_BASE_URL + '/api/projects');
            setProposedTopics([
                { title: '', description: '' },
                { title: '', description: '' }
            ]);
            fetchMyData();
            alert('Proposal cleared.');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error clearing proposal');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    const status = profile?.topicStatus || 'none';
    const approvedTopic = profile?.approvedTopic;

    return (
        <div className="student-dashboard">
            <div className="stat-card-row" style={{ gridTemplateColumns: 'minmax(280px, 350px) 1fr' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#eff6ff', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                            <User size={32} />
                        </div>
                        <h3 className="page-title" style={{ fontSize: '1.25rem' }}>{user.name}</h3>
                        <p className="page-subtitle">Matric: {user.identifier}</p>
                        
                        <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>STATUS</span>
                                <span className={`badge ${profile?.supervisor ? 'badge-approved' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                                    {profile?.supervisor ? 'ASSIGNED' : 'UNASSIGNED'}
                                </span>
                            </div>
                            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>SUPERVISOR</span>
                                <span style={{ color: profile?.supervisor ? 'var(--accent-color)' : 'var(--danger)', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>
                                    {profile?.supervisor ? profile.supervisor.name : 'Waiting...'}
                                </span>
                            </div>
                            <div className="flex-between">
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>DEPARTMENT</span>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Comp Science</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>Submission Status</h4>
                        <div className="flex-between" style={{ padding: '0.75rem', background: status === 'approved' ? '#f0fdf4' : '#fffbeb', borderRadius: '8px', border: status === 'approved' ? '1px solid #bbf7d0' : '1px solid #fef3c7', marginBottom: '1.25rem' }}>
                            <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Inbox size={16} color={status === 'approved' ? '#16a34a' : '#d97706'} /> Proposal Draft</span>
                            <span className={`badge ${status === 'approved' ? 'badge-approved' : 'badge-warning'}`} style={{ background: status === 'none' ? '#94a3b8' : undefined }}>
                                {status === 'none' ? 'NOT SUBMITTED' : status === 'approved' ? 'APPROVED' : status === 'correction' ? 'REVISION' : 'PENDING'}
                            </span>
                        </div>

                        {profile?.supervisorFeedback && (
                            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Activity size={14} /> SUPERVISOR FEEDBACK
                                </div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.5, fontStyle: 'italic' }}>
                                    "{profile.supervisorFeedback}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {approvedTopic && status === 'approved' && (
                        <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#166534' }}>YOUR APPROVED TOPIC</h3>
                            </div>
                            <div style={{ padding: '1.25rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{approvedTopic.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{approvedTopic.description}</p>
                            </div>
                        </div>
                    )}

                    {status !== 'approved' && (
                        <div className="card">
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>Propose Topics</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>Provide at least two topic choices for your supervisor to review.</p>
                            
                            <form onSubmit={handleSubmitProject}>
                                {proposedTopics.map((topic, index) => (
                                    <div key={index} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Topic Option {index + 1}</div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PROJECT TOPIC PROPOSAL</label>
                                            <input className="input-field" type="text" value={topic.title} onChange={(e) => handleTopicChange(index, 'title', e.target.value)} required placeholder={`Title for Choice ${index + 1}`} style={{ background: 'white' }} />
                                        </div>
                                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOPIC EXPLANATION</label>
                                        <textarea className="input-field" style={{ minHeight: '80px', background: 'white' }} value={topic.description} onChange={(e) => handleTopicChange(index, 'description', e.target.value)} required placeholder="Briefly describe your scope..."></textarea>
                                    </div>
                                ))}
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={addTopicField}>+ Add Option</button>
                                    <button type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderColor: '#cbd5e1' }} onClick={clearForm}><RotateCcw size={14} /> Clear Form</button>
                                    <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>Submit Topics</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
