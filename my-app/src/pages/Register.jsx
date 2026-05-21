import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextCore';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import API_BASE_URL from '../apiConfig';


const Register = () => {
    const [prefix, setPrefix] = useState('');
    const [identifierNum, setIdentifierNum] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [academicSession, setAcademicSession] = useState('');
    const [availableSessions, setAvailableSessions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/academic-sessions`);
                const data = await res.json();
                setAvailableSessions(data);
                if (data.length > 0) setAcademicSession(data[0].name);
            } catch {
                console.error('Failed to fetch sessions');
            }
        };
        const fetchDepartments = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/departments`);
                const data = await res.json();
                setDepartments(data);
                if (data.length > 0) setPrefix(data[0].prefix);
            } catch {
                console.error('Failed to fetch departments');
            }
        };
        fetchSessions();
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!academicSession) {
            setError('Please select an academic session');
            return;
        }
        if (!/^\d+$/.test(identifierNum)) {
            setError('Registration number suffix must contain only numbers (e.g. 054)');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await register({
                role: 'student',
                identifier: prefix + identifierNum,
                name,
                password,
                academicSession
            });
            navigate('/');
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
                    <UserPlus size={48} />
                </div>
                <h2>Student Registration</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Academic Session</label>
                        <select 
                            className="input-field" 
                            value={academicSession}
                            onChange={(e) => setAcademicSession(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="">Select Session</option>
                            {availableSessions.map(s => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <select 
                            className="input-field" 
                            style={{ flex: 1, marginBottom: 0, paddingLeft: '0.5rem' }}
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value)}
                            disabled={loading}
                        >
                            {departments.map(d => (
                                <option key={d._id} value={d.prefix}>{d.prefix}</option>
                            ))}
                        </select>
                        <input 
                            type="text" 
                            placeholder="Last digits (e.g. 054)" 
                            className="input-field" 
                            style={{ flex: 1.5, marginBottom: 0 }}
                            value={identifierNum}
                            onChange={(e) => setIdentifierNum(e.target.value)}
                            required
                            disabled={loading}
                            pattern="\d+"
                            title="Please enter numbers only"
                        />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="input-field" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
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
                            disabled={loading}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            style={{ position: 'absolute', right: '0.75rem', top: '40%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-success" 
                        style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Registering...
                            </>
                        ) : 'Register'}
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
