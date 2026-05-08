import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextCore';
import { BookOpen, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import './Home.css';

const StaffPortal = () => {
    const { user, logout } = useAuth();

    return (
        <div className="home-container">
            <div className="home-left" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
                <div className="home-left-bg-pattern"></div>
                <div className="home-left-content">
                    <div className="fpn-logo">
                        <GraduationCap size={64} color="white" />
                    </div>
                    <h1 className="fpn-acronym">STAFF</h1>
                    <h2 className="fpn-fullname">Supervisor Portal</h2>
                    <div className="fpn-divider"></div>
                    <p className="fpn-subtitle">Guide Students to Academic Excellence</p>
                </div>
            </div>

            <div className="home-right">
                {user ? (
                    <div className="home-right-content">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <button
                                onClick={logout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                <ArrowLeft size={16} /> Switch Account
                            </button>
                        </div>

                        <h1 className="home-title">Welcome back, {user.name.split(' ')[0]}!</h1>
                        <p className="home-description">
                            You are successfully authenticated as a <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong>. Proceed to your dashboard.
                        </p>

                        <div className="home-actions">
                            <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                Proceed to Dashboard <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="home-right-content">
                        <div className="brand-badge">
                            <BookOpen size={20} />
                            <span>Staff Portal</span>
                        </div>

                        <h1 className="home-title">Supervisor Management Interface</h1>
                        <p className="home-description">
                            Manage your assigned students, review topic proposals, and provide continuous feedback throughout the project lifecycle.
                        </p>

                        <div className="home-actions" style={{ marginBottom: '1.5rem' }}>
                            <Link to="/lecturer/login" className="btn btn-primary btn-lg" style={{ flex: 1, textAlign: 'center' }}>
                                Supervisor Login
                            </Link>
                            <Link to="/register/supervisor" className="btn btn-outline btn-lg" style={{ borderColor: '#cbd5e1', flex: 1, textAlign: 'center' }}>
                                Register as Supervisor
                            </Link>
                        </div>
                        
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <Link to="/" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowLeft size={16} /> Back to Student Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffPortal;
