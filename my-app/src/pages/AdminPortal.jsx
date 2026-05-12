import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextCore';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import './Home.css';

const AdminPortal = () => {
    const { user, logout } = useAuth();

    return (
        <div className="home-container">
            <div className="home-left" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
                <div className="home-left-bg-pattern"></div>
                <div className="home-left-content">
                    <div className="fpn-logo" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <ShieldCheck size={64} />
                    </div>
                    <h1 className="fpn-acronym">ADMIN</h1>
                    <h2 className="fpn-fullname">Secure Administrative Area</h2>
                    <div className="fpn-divider" style={{ background: '#ef4444' }}></div>
                    <p className="fpn-subtitle">Central Control & Overview</p>
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
                            <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                                Proceed to Dashboard <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="home-right-content">
                        <div className="brand-badge" style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}>
                            <ShieldCheck size={20} />
                            <span>System Administration</span>
                        </div>

                        <h1 className="home-title">Project Committee Admin Control Center</h1>
                        <p className="home-description">
                            Access the central dashboard to manage students, assign supervisors, and oversee the entire project portal infrastructure.
                        </p>

                        <div className="home-actions" style={{ marginBottom: '1.5rem' }}>
                            <Link to="/admin/login" className="btn btn-primary btn-lg" style={{ flex: 1, textAlign: 'center', backgroundColor: '#020617', color: 'white', borderColor: '#020617' }}>
                                Project Committee Admin Login
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

export default AdminPortal;
