import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextCore';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';

const AdminRegister = () => {
    const [identifier, setIdentifier] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [adminKey, setAdminKey] = useState(''); // Secret key check
    const [error, setError] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Simple client-side secret check for demo
        if (adminKey !== 'admin123') {
            setError('Invalid Administrator Security Key');
            return;
        }

        try {
            await register({
                role: 'admin',
                identifier,
                name,
                password
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card" style={{ borderColor: 'var(--danger)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--danger)' }}>
                    <ShieldAlert size={64} />
                </div>
                <h2 style={{ textAlign: 'center' }}>Elevated Admin Registration</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This page is for system administrators only. Unauthorized access is prohibited.</p>
                
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Admin ID (e.g. ADM001)" 
                        className="input-field" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                    <input 
                        type="text" 
                        placeholder="Full Admin Name" 
                        className="input-field" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <div style={{ position: 'relative' }}>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Master Password" 
                            className="input-field" 
                            style={{ paddingRight: '2.5rem' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '0.75rem', top: '40%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div style={{ borderTop: '1px solid #fee2e2', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.5rem', display: 'block' }}>SECURITY KEY REQUIRED</label>
                        <input 
                            type="password" 
                            placeholder="Enter system security key" 
                            className="input-field" 
                            style={{ borderColor: 'var(--danger)' }}
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: 'var(--danger)', border: 'none' }}>
                        Create Administrator Account
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Already an admin? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
