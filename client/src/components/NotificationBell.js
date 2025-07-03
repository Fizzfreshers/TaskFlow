import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const { token } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const fetchNotifications = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/notifications', config);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    // Listen for real-time notifications
    useEffect(() => {
        if (socket) {
            socket.on('newNotification', (newNotif) => {
                console.log("New real-time notification:", newNotif);
                setNotifications(prev => [newNotif, ...prev]); // Add to top
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                socket.off('newNotification'); // Clean up listener
            };
        }
    }, [socket]);

    const handleMarkAsRead = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginLeft: '1rem' }}>
            <button onClick={() => setShowDropdown(!showDropdown)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5em' }}>
                🔔
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '0 6px', fontSize: '0.7em' }}>
                        {unreadCount}
                    </span>
                )}
            </button>
            {showDropdown && (
                <div style={{ position: 'absolute', right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '5px', width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 10 }}>
                    {notifications.length === 0 ? (
                        <p style={{ padding: '10px' }}>No notifications.</p>
                    ) : (
                        <ul>
                            {notifications.map(notif => (
                                <li key={notif._id} style={{ padding: '10px', borderBottom: '1px solid #eee', background: notif.read ? '#f9f9f9' : 'white' }}>
                                    <p>{notif.message}</p>
                                    <small>{new Date(notif.createdAt).toLocaleString()}</small>
                                    {!notif.read && (
                                        <button onClick={() => handleMarkAsRead(notif._id)} style={{ marginLeft: '10px', fontSize: '0.8em' }}>Mark as Read</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;