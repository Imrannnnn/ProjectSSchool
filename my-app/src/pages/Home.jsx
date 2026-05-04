import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextCore';
import { BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import './Home.css';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="home-container">
            <div className="home-left">
                <div className="home-left-bg-pattern"></div>
                <div className="home-left-content">
                    <div className="fpn-logo">
                        <GraduationCap size={64} color="white" />
                    </div>
                    <h1 className="fpn-acronym">CSS</h1>
                    <h2 className="fpn-fullname">Computer science student</h2>
                    <div className="fpn-divider"></div>
                    <p className="fpn-subtitle">Excellence in Technology and Innovation</p>
                </div>
            </div>
            
            <div className="home-right">
                {user ? (
                    <div className="home-right-content">
                        <div className="brand-badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                            <BookOpen size={20} />
                            <span>Session Active</span>
                        </div>
                        
                        <h1 className="home-title">Welcome back, {user.name.split(' ')[0]}!</h1>
                        
                        <p className="home-description">
                            You are successfully authenticated as a <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong> on the Computer science student project portal. Jump right back into your dashboard to continue tracking progress and reviewing milestones.
                        </p>
                        
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#eff6ff', color: '#0f62fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{user.name}</h3>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.identifier} &bull; {user.role.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

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
                            <span>Scholarly Project System</span>
                        </div>
                        
                        <h1 className="home-title">Student Project Management Platform</h1>
                        
                        <p className="home-description">
                            Streamline your academic journey with our unified centralized platform. Specifically engineered for Computer science student, Scholarly connects students, supervisors, and administrators to seamlessly propose, track, and review final year projects.
                        </p>
                        
                        <div className="home-features">
                            <div className="feature-item">
                                <div className="feature-icon"><ArrowRight size={18} /></div>
                                <span>Submit and iteratively refine your topic proposals</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><ArrowRight size={18} /></div>
                                <span>Real-time feedback loops from your assigned supervisor</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><ArrowRight size={18} /></div>
                                <span>Built-in duplication detection safeguarding academic integrity</span>
                            </div>
                        </div>

                        <div className="home-actions" style={{ marginBottom: '1.5rem' }}>
                            <Link to="/login" className="btn btn-primary btn-lg" style={{ flex: 1, textAlign: 'center' }}>
                                Student Login
                            </Link>
                            <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: '#cbd5e1', flex: 1, textAlign: 'center' }}>
                                Student Register
                            </Link>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Staff Portal</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                        </div>

                        <div className="home-actions" style={{ marginBottom: '1.5rem' }}>
                            <Link to="/lecturer/login" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>Supervisor Login</Link>
                            <Link to="/register/supervisor" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>Supervisor Register</Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '2px' }}>Secure Admin Area</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                        </div>

                        <div className="home-actions">
                            <Link to="/admin/login" className="btn btn-primary" style={{ backgroundColor: '#020617', color: 'white', borderColor: '#ef4444', flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
                                Super Admin Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
