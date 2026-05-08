import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextCore';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, Terminal, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
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
            if (user.role !== 'admin') {
                setError('Access Denied. This portal is for Super Administrators only.');
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
        <div className="auth-container" style={{ background: '#020617' }}>
            <div className="card auth-card" style={{ maxWidth: '450px', borderTop: '4px solid #ef4444', background: '#0f172a', color: 'white' }}>
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Back to Admin Portal
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: 72, height: 72, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <ShieldCheck size={36} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'white' }}>Super Admin</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Administrative Control Center Access</p>
                </div>

                {error && (
                    <div style={{ 
                        padding: '1rem', 
                        background: 'rgba(220, 38, 38, 0.1)', 
                        color: '#f87171', 
                        borderRadius: '12px', 
                        marginBottom: '1.5rem', 
                        fontSize: '0.875rem',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <Lock size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Identifier</label>
                        <input 
                            type="text" 
                            placeholder="System ID" 
                            className="input-field" 
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            autoComplete="username"
                            disabled={loading}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', marginBottom: 0 }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Key</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="••••••••••••" 
                                className="input-field" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                disabled={loading}
                                style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', marginBottom: 0, paddingRight: '2.5rem' }}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn" 
                        disabled={loading}
                        style={{ width: '100%', padding: '0.875rem', fontWeight: 700, fontSize: '1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <Terminal size={18} /> Authenticate Admin
                            </>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #1e293b' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                        &copy; 2026 Scholarly Secure Infrastructure
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
