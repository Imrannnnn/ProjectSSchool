import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextCore';
import axios from 'axios';
import { Users, Filter, CheckSquare, Square, Check, UserCheck, AlertCircle } from 'lucide-react';

const AdminStudentAssignment = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [targetSupervisor, setTargetSupervisor] = useState('');
    const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
    
    // Range select state
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    
    const [ranges, setRanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stdRes = await axios.get(API_BASE_URL + '/api/users/students', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const supRes = await axios.get(API_BASE_URL + '/api/auth/supervisors', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const rangeRes = await axios.get(API_BASE_URL + '/api/users/ranges', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                
                // Sort students alphabetically by identifier natively
                const sortedStudents = stdRes.data.sort((a, b) => a.identifier.localeCompare(b.identifier));
                
                setStudents(sortedStudents);
                setSupervisors(supRes.data);
                setRanges(rangeRes.data);
                
                if (supRes.data.length > 0) {
                    setTargetSupervisor(supRes.data[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.token]);

    const toggleStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const displayedStudents = showUnassignedOnly ? students.filter(s => !s.supervisor) : students;

    const toggleAll = () => {
        if (selectedStudents.length === displayedStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(displayedStudents.map(s => s._id));
        }
    };
    
    const extractNumber = (str) => {
        const match = str.match(/\d+$/);
        return match ? parseInt(match[0], 10) : null;
    };

    const handleRangeSelect = () => {
        if (!rangeStart || !rangeEnd) return;
        
        const startNum = extractNumber(rangeStart);
        const endNum = extractNumber(rangeEnd);
        
        let idsToSelect = [];
        
        if (startNum !== null && endNum !== null) {
            // Numeric comparison for trailing numbers (e.g. 100 to 200, or CSC/100 to CSC/200)
            const basePrefix = rangeStart.replace(/\d+$/, '');
            idsToSelect = students.filter(s => {
                const sNum = extractNumber(s.identifier);
                const sPrefix = s.identifier.replace(/\d+$/, '');
                // Verify the prefix matches if one exists to prevent mixing different departments accidentally
                if (basePrefix && sPrefix !== basePrefix) return false;
                return sNum !== null && sNum >= startNum && sNum <= endNum;
            }).map(s => s._id);
        } else {
            // Lexicographical string comparison fallback
            idsToSelect = students.filter(s => s.identifier >= rangeStart && s.identifier <= rangeEnd).map(s => s._id);
        }
        
        // Merge with currently selected
        const newSelection = [...new Set([...selectedStudents, ...idsToSelect])];
        setSelectedStudents(newSelection);
        setMessage(`Selected ${idsToSelect.length} students in range.`);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSaveRange = async () => {
        if (!rangeStart || !rangeEnd) {
            setMessage('Please enter both start and end registration numbers.');
            return;
        }

        if (!window.confirm(`Save this range? Any new students registering within this range will be automatically assigned to the selected supervisor.`)) return;

        try {
            const res = await axios.post(API_BASE_URL + '/api/users/ranges', 
                { supervisorId: targetSupervisor, startIdentifier: rangeStart, endIdentifier: rangeEnd },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            
            setMessage(`Range saved! ${res.data.assignedExistingCount} existing students were also assigned.`);
            
            // Refresh data
            const rangeRes = await axios.get(API_BASE_URL + '/api/users/ranges', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRanges(rangeRes.data);
            
            // Also refresh students to see new assignments
            const stdRes = await axios.get(API_BASE_URL + '/api/users/students', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStudents(stdRes.data.sort((a, b) => a.identifier.localeCompare(b.identifier)));

            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error(error);
            setMessage('Failed to save range assignment.');
        }
    };

    const handleDeleteRange = async (id) => {
        if (!window.confirm('Are you sure you want to delete this range assignment? Future students will no longer be auto-assigned.')) return;
        try {
            await axios.delete(API_BASE_URL + `/api/users/ranges/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRanges(ranges.filter(r => r._id !== id));
            setMessage('Range assignment deleted.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Failed to delete range.');
        }
    };

    const handleAssign = async () => {
        if (selectedStudents.length === 0) {
            setMessage('Please select at least one student.');
            return;
        }
        
        if (!window.confirm(`Are you sure you want to assign ${selectedStudents.length} students to this supervisor?`)) return;

        try {
            await axios.post(API_BASE_URL + '/api/users/assign-supervisor', 
                { supervisorId: targetSupervisor, studentIds: selectedStudents },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            
            // Optimistic update
            const targetSupObj = supervisors.find(s => s._id === targetSupervisor);
            setStudents(students.map(s => {
                if (selectedStudents.includes(s._id)) {
                    return { ...s, supervisor: targetSupObj };
                }
                return s;
            }));
            
            setMessage(`Successfully assigned ${selectedStudents.length} students!`);
            setSelectedStudents([]); // Clear selection after success
            setTimeout(() => setMessage(''), 4000);
        } catch (error) {
            console.error(error);
            setMessage('Failed to assign students. Please try again.');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading directory...</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={24} color="var(--accent-color)" /> Bulk Student Assignment
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Oversee all registered students and supervisors. You can select ranges of registration numbers (e.g. from MAT/001 to MAT/100) and formally assign them to a supervisor.
                </p>
            </div>

            <div className="grid-cols-2" style={{ gridTemplateColumns: 'minmax(350px, 1fr) minmax(300px, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* RANGE TOOL PANEL */}
                <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} /> Select by Range
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>From (Reg No.)</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="e.g. 100" 
                                value={rangeStart}
                                onChange={e => setRangeStart(e.target.value)}
                                style={{ background: 'white' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>To (Reg No.)</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="e.g. 200" 
                                value={rangeEnd}
                                onChange={e => setRangeEnd(e.target.value)}
                                style={{ background: 'white' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" onClick={handleRangeSelect} style={{ flex: 1, background: 'white', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                            Test Selection
                        </button>
                        <button className="btn btn-primary" onClick={handleSaveRange} style={{ flex: 1, marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                            Save as Auto-Assign
                        </button>
                    </div>
                    
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                        <UserCheck size={18} /> Target Supervisor
                    </h3>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <select 
                            className="input-field" 
                            value={targetSupervisor}
                            onChange={(e) => setTargetSupervisor(e.target.value)}
                            style={{ background: 'white', fontWeight: 600, color: 'var(--accent-color)' }}
                        >
                            {supervisors.map(sup => (
                                <option key={sup._id} value={sup._id}>{sup.name} ({sup.identifier})</option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: '#1e3a8a' }}>Selected Students:</span>
                            <span style={{ background: '#1e40af', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                {selectedStudents.length}
                            </span>
                        </div>
                    </div>
                    
                    {message && (
                        <div style={{ padding: '0.75rem', background: message.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: message.includes('Failed') ? '#b91c1c' : '#16a34a', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {message.includes('Failed') ? <AlertCircle size={16} /> : <Check size={16} />} {message}
                        </div>
                    )}
                    
                    <button 
                        className="btn btn-primary" 
                        onClick={handleAssign} 
                        style={{ width: '100%', marginBottom: '1rem' }}
                        disabled={selectedStudents.length === 0}
                    >
                        Assign Selected Now
                    </button>

                    {/* ACTIVE AUTO-ASSIGN RULES */}
                    <div style={{ marginTop: '2rem', borderTop: '2px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Active Auto-Assign Rules
                        </h3>
                        {ranges.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                No persistent ranges defined yet.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {ranges.map(r => (
                                    <div key={r._id} style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{r.startIdentifier} - {r.endIdentifier}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{r.supervisor?.name || 'Unknown'}</div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteRange(r._id)}
                                            style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* STUDENTS TABLE */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Overall Student Roster</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', background: showUnassignedOnly ? '#fef2f2' : 'transparent', padding: '0.2rem 0.6rem', borderRadius: '4px', border: showUnassignedOnly ? '1px solid #fecaca' : '1px solid transparent', color: showUnassignedOnly ? '#b91c1c' : 'var(--text-secondary)' }}>
                                <input type="checkbox" checked={showUnassignedOnly} onChange={(e) => { setShowUnassignedOnly(e.target.checked); setSelectedStudents([]); }} style={{ cursor: 'pointer' }} />
                                Show Unassigned Only
                            </label>

                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={toggleAll}>
                                {selectedStudents.length === displayedStudents.length && displayedStudents.length > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                    </div>
                    
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <table className="topic-table" style={{ margin: 0 }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}></th>
                                    <th>Reg. Number</th>
                                    <th>Student Name</th>
                                    <th>Current Supervisor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedStudents.map(s => (
                                    <tr 
                                        key={s._id} 
                                        onClick={() => toggleStudent(s._id)} 
                                        style={{ 
                                            cursor: 'pointer', 
                                            background: selectedStudents.includes(s._id) ? '#f0fdf4' : 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <td style={{ textAlign: 'center' }}>
                                            {selectedStudents.includes(s._id) ? (
                                                <CheckSquare size={18} color="#16a34a" />
                                            ) : (
                                                <Square size={18} color="#cbd5e1" />
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {s.identifier}
                                            </span>
                                        </td>
                                        <td>{s.name}</td>
                                        <td>
                                            {s.supervisor ? (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.supervisor.name}</span>
                                            ) : (
                                                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>UNASSIGNED</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {displayedStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                            {showUnassignedOnly ? 'Great news! All students are assigned.' : 'No students found in the system.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStudentAssignment;
