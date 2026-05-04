import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextCore';
import { LogOut, LayoutDashboard, FolderKanban, Flag, Database, Activity, ShieldAlert, MessageSquare } from 'lucide-react';
import StudentDashboard from '../components/StudentDashboard';
import SupervisorDashboard from '../components/SupervisorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import ApprovedTopicsRepository from '../components/ApprovedTopicsRepository';
import AdminStudentAssignment from '../components/AdminStudentAssignment';
import { Users } from 'lucide-react';

const DashboardRouter = () => {
    const { user, logout, socket } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (!socket) return;
        socket.on('project_submitted', () => setNotifications(prev => [{ id: Date.now(), msg: 'A student submitted a new project' }, ...prev]));
        socket.on('project_status_updated', () => setNotifications(prev => [{ id: Date.now(), msg: 'A project status was updated' }, ...prev]));
        socket.on('new_admin_review', () => setNotifications(prev => [{ id: Date.now(), msg: 'A project is pending admin review' }, ...prev]));
        socket.on('new_feedback', () => setNotifications(prev => [{ id: Date.now(), msg: 'New feedback added to a project' }, ...prev]));
        return () => {
            socket.off('project_submitted');
            socket.off('project_status_updated');
            socket.off('new_admin_review');
            socket.off('new_feedback');
        };
    }, [socket]);

    const renderDashboard = () => {
        switch(user.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'supervisor':
                return <SupervisorDashboard />;
            case 'student':
            default:
                return <StudentDashboard />;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="brand-title">
                    <Database size={24} />
                    Scholarly
                </div>
                
                <div style={{ flex: 1 }}>
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={18} /> {user.role === 'admin' ? 'Overview' : 'Dashboard'}
                    </div>
                    
                    {user.role === 'student' && (
                        <>
                            <div className={`nav-item ${activeTab === 'repository' ? 'active' : ''}`} onClick={() => setActiveTab('repository')}><Database size={18} /> Approved Topics</div>
                        </>
                    )}
                    
                    {user.role === 'supervisor' && (
                        <>
                            <div className={`nav-item ${activeTab === 'repository' ? 'active' : ''}`} onClick={() => setActiveTab('repository')}><Database size={18} /> Approved Topics</div>
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <div className="nav-item"><FolderKanban size={18} /> Student Progress</div>
                            <div className="nav-item"><Flag size={18} /> Milestones</div>
                            <div className={`nav-item ${activeTab === 'repository' ? 'active' : ''}`} onClick={() => setActiveTab('repository')}><Database size={18} /> Approved Topics</div>
                            <div className="nav-item"><Activity size={18} /> Analytics</div>
                            <div className="nav-item" style={{ marginTop: '1rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                                <ShieldAlert size={18} /> Admin Panel
                            </div>
                            <div className={`nav-item ${activeTab === 'assignment' ? 'active' : ''}`} onClick={() => setActiveTab('assignment')} style={{ paddingLeft: '2rem' }}>
                                <Users size={16} /> Bulk Assignment
                            </div>
                        </>
                    )}
                    
                    {/* Messages removed as part of project simplification */}
                </div>

                <div className="nav-item" onClick={logout} style={{ color: 'var(--danger)', marginTop: 'auto' }}>
                    <LogOut size={18} /> Logout
                </div>
            </div>
            
            <div className="main-content">
                <div className="top-bar">
                    <div>
                        <h1 className="page-title" style={{ display: 'none' }}>Dashboard</h1> {/* Handled in components */}
                    </div>
                    
                    <div className="user-controls">
                        <div className="notification-bell">
                            <Activity size={20} />
                            {notifications.length > 0 && <span style={{ position: 'absolute', top: -2, right: -2, background: 'var(--danger)', width: 8, height: 8, borderRadius: '50%' }}></span>}
                        </div>
                        <div className="user-profile-pill">
                            <div className="avatar">
                                {user.name.charAt(0)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                <span>{user.name.split(' ')[0]}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{user.identifier}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {activeTab === 'dashboard' ? renderDashboard() : null}
                {activeTab === 'repository' ? <ApprovedTopicsRepository /> : null}
                {activeTab === 'assignment' ? <AdminStudentAssignment /> : null}
            </div>
        </div>
    );
};

export default DashboardRouter;
