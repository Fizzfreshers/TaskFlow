import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const { data } = await axios.get('http://localhost:5000/api/users/me');
                    setUser(data); // Set user from backend response
                } catch (error) {
                    console.error("Token is invalid, logging out.", error);
                    logout();
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    };

    const register = async (name, email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    };
    
    const logout = () => {
        localStorage.removeItem('token');
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