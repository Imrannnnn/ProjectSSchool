import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextCore';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';


const Register = () => {
    const [prefix, setPrefix] = useState('HND II/swd/');
    const [identifierNum, setIdentifierNum] = useState('');
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
                role: 'student',
                identifier: prefix + identifierNum,
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
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
                    <UserPlus size={48} />
                </div>
                <h2>Student Registration</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <select 
                            className="input-field" 
                            style={{ flex: 1, marginBottom: 0, paddingLeft: '0.5rem' }}
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value)}
                        >
                            <option value="HND II/swd/">HND II/swd/</option>
                            <option value="HND II/NCC/">HND II/NCC/</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder="Last digits (e.g. 054)" 
                            className="input-field" 
                            style={{ flex: 1.5, marginBottom: 0 }}
                            value={identifierNum}
                            onChange={(e) => setIdentifierNum(e.target.value)}
                            required
                        />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
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
                    <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '1rem' }}>
                        Register
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
