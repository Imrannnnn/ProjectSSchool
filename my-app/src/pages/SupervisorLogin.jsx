import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextCore';
import { useNavigate, Link } from 'react-router-dom';
import { Users, GraduationCap, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const SupervisorLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const user = await login(identifier, password);
            if (user.role !== 'supervisor') {
                setError('This portal is for Supervisors ONLY. Students and Admins should use their respective portals.');
                setLoading(false);
                return;
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className="card auth-card" style={{ maxWidth: '450px', borderTop: '4px solid #3b82f6' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ width: 64, height: 64, background: '#eff6ff', color: '#3b82f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <GraduationCap size={32} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Staff Portal</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Supervisor & Admin Authentication</p>
                </div>

                {error && (
                    <div style={{ 
                        padding: '0.75rem', 
                        background: '#fef2f2', 
                        color: '#b91c1c', 
                        borderRadius: '8px', 
                        marginBottom: '1.5rem', 
                        fontSize: '0.875rem',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <ShieldCheck size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username / Staff ID</label>
                        <input 
                            type="text" 
                            placeholder="Enter your identifier" 
                            className="input-field" 
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            autoComplete="username"
                            disabled={loading}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Secret Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="••••••••" 
                                className="input-field" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                disabled={loading}
                                style={{ marginBottom: 0, paddingRight: '2.5rem' }}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '0.75rem', fontWeight: 600, fontSize: '1rem', background: '#3b82f6', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Securing Session...
                            </>
                        ) : 'Secure Login'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        New Supervisor? <Link to="/register/supervisor" style={{ color: '#3b82f6', fontWeight: 600 }}>Create an account</Link>
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Are you a student? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Go to Student Portal</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SupervisorLogin;
