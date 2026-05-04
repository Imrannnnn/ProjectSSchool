import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextCore';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff } from 'lucide-react';

const SupervisorRegister = () => {
    const [identifier, setIdentifier] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await register({
                role: 'supervisor',
                identifier,
                name,
                password
            });
            navigate('/');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#0f62fe' }}>
                    <Briefcase size={48} />
                </div>
                <h2>Supervisor Registration</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Staff ID / Identifier" 
                        className="input-field" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                    <input 
                        type="text" 
                        placeholder="Full Name (e.g. Dr. Jane Doe)" 
                        className="input-field" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <div style={{ position: 'relative' }}>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Password" 
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
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Register as Supervisor
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
                <div style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Are you a student? <Link to="/register">Student Registration</Link>
                </div>
            </div>
        </div>
    );
};

export default SupervisorRegister;
