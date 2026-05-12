import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { Plus, Trash2, Calendar, AlertCircle, Loader2 } from 'lucide-react';

const AcademicSessionManager = () => {
    const [sessions, setSessions] = useState([]);
    const [newSession, setNewSession] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);

    const fetchSessions = async () => {
        setFetching(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/academic-sessions`);
            setSessions(res.data);
            setError(null);
        } catch {
            setError('Failed to fetch academic sessions');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleAddSession = async (e) => {
        e.preventDefault();
        if (!newSession.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/academic-sessions`, { name: newSession });
            setSessions([res.data, ...sessions]);
            setNewSession('');
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add session');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm('Are you sure you want to delete this session?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/academic-sessions/${id}`);
            setSessions(sessions.filter(s => s._id !== id));
        } catch {
            setError('Failed to delete session');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Calendar size={24} color="var(--accent-color)" />
                <h3 style={{ margin: 0 }}>Academic Sessions Management</h3>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleAddSession} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <input 
                    type="text" 
                    placeholder="e.g. 2025/2026" 
                    className="input-field" 
                    style={{ flex: 1, marginBottom: 0 }}
                    value={newSession}
                    onChange={(e) => setNewSession(e.target.value)}
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    disabled={loading || !newSession.trim()}
                >
                    {loading ? <Loader2 size={18} className="spinner" /> : <Plus size={18} />} Add
                </button>
            </form>

            <div className="sessions-list">
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Existing Sessions</h4>
                {fetching ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}><Loader2 className="spinner" /></div>
                ) : sessions.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>No academic sessions added yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sessions.map(session => (
                            <div key={session._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontWeight: 600 }}>{session.name}</span>
                                <button 
                                    onClick={() => handleDeleteSession(session._id)}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademicSessionManager;
