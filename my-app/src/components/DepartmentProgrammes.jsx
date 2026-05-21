import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, FileText, Save, Shield, UserCheck, Users } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const DepartmentProgrammes = () => {
    const [stats, setStats] = useState(null);

    const fetchDepartmentStats = async () => {
        try {
            const res = await axios.get(API_BASE_URL + '/api/users/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const loadDepartmentStats = async () => {
            await fetchDepartmentStats();
        };

        loadDepartmentStats();
    }, []);

    return (
        <div>
            <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
                <div style={{ maxWidth: '760px' }}>
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
                        <Shield size={14} /> Department Programmes
                    </div>
                    <h2 className="page-title" style={{ fontSize: '1.7rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                        Department Enrollment & Progress Oversight
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                        Review programme capacity, enrollment distribution, supervisor assignment progress, and topic submission coverage across departments.
                    </p>
                </div>
            </div>

            {stats?.departmentStats && stats.departmentStats.length > 0 ? (
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
                                                        fetchDepartmentStats();
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
            ) : (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No department programme data is available yet.
                </div>
            )}
        </div>
    );
};

export default DepartmentProgrammes;
