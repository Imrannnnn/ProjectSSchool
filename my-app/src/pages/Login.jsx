import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextCore';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [prefix, setPrefix] = useState('HND II/swd/');
    const [identifierNum, setIdentifierNum] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const user = await login(prefix + identifierNum, password);
            if (user.role !== 'student') {
                setError('Staff should use the dedicated Supervisor Portal.');
                return;
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="auth-container" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f1f5f9 100%)' }}>
            <div className="card auth-card" style={{ maxWidth: '450px', borderTop: '4px solid var(--accent-color)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    <div style={{ width: 64, height: 64, background: '#eff6ff', color: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <BookOpen size={32} />
                    </div>
                </div>
                <h2>Student Portal</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>Authentication for student of Computer science</p>
                {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', border: '1px solid #fecaca' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Registration Number</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                className="input-field"
                                style={{ flex: '1', marginBottom: 0, paddingLeft: '0.5rem', minWidth: '150px' }}
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                            >
                                <option value="HND II/swd/">HND II/swd/</option>
                                <option value="HND II/NCC/">HND II/NCC/</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Digits"
                                className="input-field"
                                style={{ flex: '0.8', marginBottom: 0 }}
                                value={identifierNum}
                                onChange={(e) => setIdentifierNum(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="input-field"
                                style={{ marginBottom: 0, paddingRight: '2.5rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontSize: '1rem' }}>
                        Sign In to Dashboard
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    New Student? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                    <p style={{ display: 'inline', fontSize: '0.875rem' }}>Are you a Supervisor? </p>
                    <Link to="/lecturer/login" style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Staff Gateway</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
