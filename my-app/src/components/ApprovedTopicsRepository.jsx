import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextCore';
import axios from 'axios';
import { Database, FileText, ChevronLeft, ChevronRight, Award } from 'lucide-react';

const ApprovedTopicsRepository = () => {
    useAuth(); // Keeping the hook call if it provides context side effects, otherwise could be removed. Actually, useAuth is usually for getting state. If not used, just remove it. Wait, the lint says it's assigned but not used. So I'll just remove the assignment.
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
            const res = await axios.get(`${API_BASE_URL}/api/projects/approved?letter=${letter}&page=${page}&limit=${limit}`);
            setProjects(res.data.projects);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [letter, page]);

    useEffect(() => {
        fetchApprovedProjects();
    }, [fetchApprovedProjects]);

    const handleLetterClick = (l) => {
        setLetter(l);
        setPage(1);
    };

    return (
        <div className="repository-container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="page-title" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={24} color="var(--accent-color)" /> Approved Topics
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>View all officially approved topics. Filter alphabetically by title.</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', borderTop: '4px solid var(--accent-color)', padding: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
                    {alphabets.map(alpha => (
                        <button 
                            key={alpha} 
                            onClick={() => handleLetterClick(alpha)}
                            style={{ 
                                padding: '0.4rem 0.6rem', 
                                border: `1px solid ${letter === alpha ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                borderRadius: '6px',
                                background: letter === alpha ? 'var(--accent-color)' : 'white',
                                color: letter === alpha ? 'white' : 'var(--text-primary)',
                                fontWeight: letter === alpha ? '600' : '500',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'all 0.2s',
                                minWidth: alpha === 'All' ? '50px' : '32px'
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
                                <th>Student</th>
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
                                            <div className="avatar" style={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                                                {p.student?.name ? p.student.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.student?.name || 'Unknown User'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                                            {p.student?.identifier || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem' }}>
                                            <Award size={10} /> Approved
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
                {totalPages > 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#f8fafc', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Page {page} of {totalPages}
                        </span>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
                            <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} 
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => {
                                if (i + 1 === 1 || i + 1 === totalPages || Math.abs(page - (i + 1)) <= 1) {
                                    return (
                                        <button 
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                border: `1px solid ${page === i + 1 ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                background: page === i + 1 ? 'var(--accent-color)' : 'white',
                                                color: page === i + 1 ? 'white' : 'var(--text-primary)',
                                                borderRadius: '6px',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                minWidth: '32px'
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    )
                                } else if ((i + 1 === 2 && page > 3) || (i + 1 === totalPages - 1 && page < totalPages - 2)) {
                                    return <span key={i + 1} style={{ padding: '0.4rem', fontSize: '0.75rem' }}>...</span>
                                }
                                return null;
                            })}
                            
                            <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} 
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovedTopicsRepository;
