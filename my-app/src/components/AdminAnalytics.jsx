import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, Shield, TrendingUp, Users } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [queue, setQueue] = useState([]);

    const fetchAnalytics = async () => {
        try {
            const [queueRes, statsRes] = await Promise.all([
                axios.get(API_BASE_URL + '/api/projects/admin/queue'),
                axios.get(API_BASE_URL + '/api/users/admin/stats')
            ]);
            setQueue(queueRes.data || []);
            setStats(statsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const loadAnalytics = async () => {
            await fetchAnalytics();
        };

        loadAnalytics();
    }, []);

    const pendingVerificationCount = queue.filter((student) => student.topicStatus === 'approved_by_supervisor').length;
    const verifiedStudentsCount = queue.filter((student) => student.topicStatus === 'approved').length;
    const completionRate = stats?.totals?.students
        ? Math.round((verifiedStudentsCount / stats.totals.students) * 100)
        : 0;

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
                        <TrendingUp size={14} /> Analytics
                    </div>
                    <h2 className="page-title" style={{ fontSize: '1.7rem', fontWeight: 700, margin: '0 0 0.6rem 0' }}>
                        Enrollment and verification performance
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                        Track overall student volume, approval flow, supervisor capacity, and verification progress from a cleaner dedicated analytics workspace.
                    </p>
                </div>
            </div>

            <div className="stat-card-row" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card success-top">
                    <div className="stat-title">Total Students <Users size={16} /></div>
                    <div className="stat-value">{stats?.totals?.students || 0}</div>
                    <div className="stat-subtitle gray">Registered across all departments</div>
                </div>
                <div className="stat-card warning-top">
                    <div className="stat-title">Pending Verification <Clock size={16} /></div>
                    <div className="stat-value">{pendingVerificationCount}</div>
                    <div className="stat-subtitle gray">Awaiting final admin approval</div>
                </div>
                <div className="stat-card success-top">
                    <div className="stat-title">Verified Students <CheckCircle2 size={16} /></div>
                    <div className="stat-value">{verifiedStudentsCount}</div>
                    <div className="stat-subtitle">Students with fully approved topics</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Supervisors <Shield size={16} /></div>
                    <div className="stat-value">{stats?.totals?.supervisors || 0}</div>
                    <div className="stat-subtitle gray">Active faculty accounts</div>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1rem'
                }}
            >
                <div className="card">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Verification Coverage
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.35rem' }}>{completionRate}%</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Portion of registered students whose topics have completed the full approval cycle.
                    </div>
                </div>

                <div className="card">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Approved Repository
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.35rem' }}>{stats?.totals?.approvedProjects || 0}</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Topics currently recorded inside the official approved project archive.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
