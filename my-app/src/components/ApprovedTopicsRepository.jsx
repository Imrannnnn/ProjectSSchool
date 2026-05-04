import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextCore';
import axios from 'axios';
import { Database, FileText, ChevronLeft, ChevronRight, Award } from 'lucide-react';

const ApprovedTopicsRepository = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [letter, setLetter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const alphabets = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

    const fetchApprovedProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/projects/approved?letter=${letter}&page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setProjects(res.data.projects);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [letter, page, user.token]);

    useEffect(() => {
        fetchApprovedProjects();
    }, [fetchApprovedProjects]);

    const handleLetterClick = (l) => {
        setLetter(l);
        setPage(1); // Reset to first page whenever filtering changes
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={24} color="var(--accent-color)" /> Approved Topics Repository
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>View all officially approved standard topics. Filter alphabetically by project title.</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', borderTop: '4px solid var(--accent-color)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: 'center' }}>
                    {alphabets.map(alpha => (
                        <button 
                            key={alpha} 
                            onClick={() => handleLetterClick(alpha)}
                            style={{ 
                                padding: '0.5rem 0.75rem', 
                                border: `1px solid ${letter === alpha ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                borderRadius: '8px',
                                background: letter === alpha ? 'var(--accent-color)' : 'white',
                                color: letter === alpha ? 'white' : 'var(--text-primary)',
                                fontWeight: letter === alpha ? '600' : '500',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s',
                                minWidth: alpha === 'All' ? 'auto' : '36px'
                            }}
                        >
                            {alpha}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <span>Repository Content <span className="badge badge-pending" style={{ marginLeft: '0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1' }}>{total} Total</span></span>
                </div>
                
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading topics...</div>
                ) : projects.length === 0 ? (
                    <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <FileText size={48} color="#cbd5e1" style={{ marginBottom: '1rem', display: 'block', margin: '0 auto 1rem auto' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No Approved Topics Found</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>There are currently no topics matching '{letter}'.</p>
                    </div>
                ) : (
                    <table className="topic-table">
                        <thead>
                            <tr>
                                <th>Project Topic</th>
                                <th>Student Details</th>
                                <th>Reg Number</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(p => (
                                <tr key={p._id}>
                                    <td style={{ maxWidth: '300px' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{p.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#f1f5f9', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                                {p.student?.name ? p.student.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{p.student?.name || 'Unknown User'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                            {p.student?.identifier || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Award size={12} /> Approved
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Showing page {page} of {totalPages}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.5rem 0.75rem', background: page === 1 ? '#e2e8f0' : 'transparent', border: '1px solid var(--border-color)', cursor: page === 1 ? 'not-allowed' : 'pointer' }} 
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => {
                                if (i + 1 === 1 || i + 1 === totalPages || Math.abs(page - (i + 1)) <= 1) {
                                    return (
                                        <button 
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: `1px solid ${page === i + 1 ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                background: page === i + 1 ? 'var(--accent-color)' : 'white',
                                                color: page === i + 1 ? 'white' : 'var(--text-primary)',
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    )
                                } else if (i + 1 === 2 && page > 3) {
                                    return <span key={i + 1} style={{ padding: '0.5rem' }}>...</span>
                                } else if (i + 1 === totalPages - 1 && page < totalPages - 2) {
                                    return <span key={i + 1} style={{ padding: '0.5rem' }}>...</span>
                                }
                                return null;
                            })}
                            
                            <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.5rem 0.75rem', background: page === totalPages ? '#e2e8f0' : 'transparent', border: '1px solid var(--border-color)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }} 
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovedTopicsRepository;
