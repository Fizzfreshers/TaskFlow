import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Load user data if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    // You might have a /api/auth/me route later to verify token on server
                    // For now, just set user from local storage token data if available or assume valid
                    // In a real app, you'd verify this with a backend call
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    if (storedUser && storedUser.token === token) {
                        setUser(storedUser);
                    }
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (error) {
                    console.error("Failed to load user or token invalid:", error);
                    logout(); // Clear invalid token
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data)); // Store user data
        setToken(res.data.token);
        setUser(res.data);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    };

    const register = async (username, email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};