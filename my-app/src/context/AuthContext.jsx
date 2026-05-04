import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContextCore';

// Configure axios globally to send credentials (cookies)
axios.defaults.withCredentials = true;

const INACTIVITY_LIMIT = 25 * 60 * 1000; // 25 mins of local inactivity (leads to warning)
const WARNING_LIMIT = 5 * 60 * 1000; // 5 mins of warning before logout

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showInactivityWarning, setShowInactivityWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins in seconds

    const activityTimeout = useRef(null);
    const warningInterval = useRef(null);

    const logout = useCallback(async () => {
        try {
            await axios.post(API_BASE_URL + '/api/auth/logout');
            setUser(null);
            localStorage.removeItem('user'); 
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            setShowInactivityWarning(false);
        } catch (err) {
            console.error('Logout failed', err);
        }
    }, [socket]);

    const connectSocket = useCallback((u) => {
        const newSocket = io(API_BASE_URL + '');
        newSocket.on('connect', () => {
            newSocket.emit('register', u._id);
        });
        setSocket(newSocket);
    }, []);

    const startWarningCountdown = useCallback(() => {
        if (warningInterval.current) clearInterval(warningInterval.current);
        warningInterval.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(warningInterval.current);
                    logout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [logout]);

    const resetInactivityTimer = useCallback(() => {
        if (showInactivityWarning) {
            setShowInactivityWarning(false);
            setTimeLeft(300);
            if (warningInterval.current) clearInterval(warningInterval.current);
            // Ping server to reset server-side idle timer
            axios.post(API_BASE_URL + '/api/auth/refresh-token').catch(() => logout());
        }
        
        if (activityTimeout.current) clearTimeout(activityTimeout.current);
        
        activityTimeout.current = setTimeout(() => {
            setShowInactivityWarning(true);
            startWarningCountdown();
        }, INACTIVITY_LIMIT);
    }, [showInactivityWarning, startWarningCountdown, logout]);



    useEffect(() => {
        const fetchInitialUser = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Verify if session is still valid
                    await axios.post(API_BASE_URL + '/api/auth/refresh-token');
                    setUser(parsedUser);
                    connectSocket(parsedUser);
                } catch {
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        fetchInitialUser();
    }, [connectSocket]);

    useEffect(() => {
        if (user) {
            window.addEventListener('mousemove', resetInactivityTimer);
            window.addEventListener('keydown', resetInactivityTimer);
            window.addEventListener('scroll', resetInactivityTimer);
            window.addEventListener('click', resetInactivityTimer);
            
            // Set initial timer instead of calling it synchronously if possible, 
            // or just ensure it's handled.
            const timeout = setTimeout(() => resetInactivityTimer(), 0);
            return () => {
                clearTimeout(timeout);
                window.removeEventListener('mousemove', resetInactivityTimer);
                window.removeEventListener('keydown', resetInactivityTimer);
                window.removeEventListener('scroll', resetInactivityTimer);
                window.removeEventListener('click', resetInactivityTimer);
                if (activityTimeout.current) clearTimeout(activityTimeout.current);
                if (warningInterval.current) clearInterval(warningInterval.current);
            };
        }
    }, [user, resetInactivityTimer]);



    const login = async (identifier, password) => {
        try {
            const res = await axios.post(API_BASE_URL + '/api/auth/login', { identifier, password });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            connectSocket(res.data);
            return res.data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post(API_BASE_URL + '/api/auth/register', userData);
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            connectSocket(res.data);
            return res.data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    // Axios interceptor for handling token expiration
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh-token')) {
                    originalRequest._retry = true;
                    try {
                        await axios.post(API_BASE_URL + '/api/auth/refresh-token');
                        return axios(originalRequest);
                    } catch {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, socket }}>
            {!loading && children}
            {showInactivityWarning && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
                        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Inactivity Warning</h3>
                        <p>Your session will expire in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} due to inactivity.</p>
                        <button className="btn btn-primary" onClick={resetInactivityTimer} style={{ width: '100%', marginTop: '1rem' }}>I'm still here!</button>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};
