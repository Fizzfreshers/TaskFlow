import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth'); // Redirect to auth page after logout
    };

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f0f0f0' }}>
            <h1>TaskFlow</h1>
            <nav>
                {user ? (
                    <>
                        <span>Welcome, {user.name}</span>
                        <NotificationBell />
                        <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/auth">Login / Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;