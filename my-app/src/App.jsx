import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContextCore';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SupervisorRegister from './pages/SupervisorRegister';
import AdminRegister from './pages/AdminRegister';
import SupervisorLogin from './pages/SupervisorLogin';
import AdminLogin from './pages/AdminLogin';
import DashboardRouter from './pages/DashboardRouter';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/lecturer/login" element={<SupervisorLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register/supervisor" element={<SupervisorRegister />} />
                    <Route path="/admin/secret-register" element={<AdminRegister />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <DashboardRouter />
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
