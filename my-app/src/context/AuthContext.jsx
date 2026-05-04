import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContextCore';

// Configure axios globally 
// Removed axios.defaults.withCredentials = true as we are using headers now

const INACTIVITY_LIMIT = 25 * 60 * 1000; // 25 mins of local inactivity (leads to warning)
const WARNING_LIMIT = 5 * 60 * 1000; // 5 mins of warning before logout

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showInactivityWarning, setShowInactivityWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    const activityTimeout = useRef(null);
    const warningInterval = useRef(null);

    const logout = useCallback(async (isAuto = false) => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            // If it's an auto-logout due to error, we might not want to wait for network
            if (!isAuto) {
                await axios.post(API_BASE_URL + '/api/auth/logout', { refreshToken });
            }
        } catch (err) {
            console.error('Logout request failed', err);
        } finally {
            setUser(null);
            localStorage.removeItem('user'); 
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            setShowInactivityWarning(false);
        }
    }, [socket]);

    const connectSocket = useCallback((u) => {
        if (!u?._id) return;
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
                    logout(true); // Auto logout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [logout]);

    const refreshTokenFunc = useCallback(async () => {
        try {
            const currentRefreshToken = localStorage.getItem('refreshToken');
            if (!currentRefreshToken) throw new Error('No refresh token');

            const res = await axios.post(API_BASE_URL + '/api/auth/refresh-token', { 
                refreshToken: currentRefreshToken 
            });
            
            const { accessToken, refreshToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            return accessToken;
        } catch (err) {
            // Only force logout if it's a 401/403 (Invalid token)
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout(true);
            }
            throw err;
        }
    }, [logout]);

    const resetInactivityTimer = useCallback(() => {
        if (showInactivityWarning) {
            setShowInactivityWarning(false);
            setTimeLeft(300);
            if (warningInterval.current) clearInterval(warningInterval.current);
            // Ping server to reset server-side idle timer
            refreshTokenFunc().catch(() => {});
        }
        
        if (activityTimeout.current) clearTimeout(activityTimeout.current);
        
        activityTimeout.current = setTimeout(() => {
            setShowInactivityWarning(true);
            startWarningCountdown();
        }, INACTIVITY_LIMIT);
    }, [showInactivityWarning, startWarningCountdown, refreshTokenFunc]);

    useEffect(() => {
        const fetchInitialUser = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');
            
            if (storedUser && accessToken) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Background verification
                    await refreshTokenFunc();
                    connectSocket(parsedUser);
                } catch (err) {
                    console.error('Initial session restore failed', err);
                    // We don't necessarily clear user here unless refreshTokenFunc already called logout
                }
            }
            setLoading(false);
        };
        fetchInitialUser();
    }, [connectSocket, refreshTokenFunc]);

    useEffect(() => {
        if (user) {
            window.addEventListener('mousemove', resetInactivityTimer);
            window.addEventListener('keydown', resetInactivityTimer);
            window.addEventListener('scroll', resetInactivityTimer);
            window.addEventListener('click', resetInactivityTimer);
            
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
            const { accessToken, refreshToken, ...userData } = res.data;
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            connectSocket(userData);
            return userData;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post(API_BASE_URL + '/api/auth/register', userData);
            const { accessToken, refreshToken, ...data } = res.data;
            
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            connectSocket(data);
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    // Axios interceptors for handling tokens
    useEffect(() => {
        const reqInterceptor = axios.interceptors.request.use(
            config => {
                const token = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                if (refreshToken) {
                    config.headers['x-refresh-token'] = refreshToken;
                }
                return config;
            },
            error => Promise.reject(error)
        );

        const resInterceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh-token') && !originalRequest.url.includes('/login')) {
                    originalRequest._retry = true;
                    try {
                        const newToken = await refreshTokenFunc();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    } catch {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.request.eject(reqInterceptor);
            axios.interceptors.response.eject(resInterceptor);
        };
    }, [logout, refreshTokenFunc]);

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
