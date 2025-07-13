import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Badge, IconButton, Menu, MenuItem, ListItemText, Typography, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const { token } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const unreadCount = notifications.filter(n => !n.read).length;
    const open = Boolean(anchorEl);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/notifications', config);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    useEffect(() => {
        if (socket) {
            socket.on('newNotification', (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
            });
            return () => socket.off('newNotification');
        }
    }, [socket]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <div>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ style: { maxHeight: 400, width: '35ch' } }}
            >
                {notifications.length === 0 ? (
                    <MenuItem onClick={handleClose}>No new notifications</MenuItem>
                ) : (
                    notifications.map(notif => (
                        <MenuItem
                            key={notif._id}
                            onClick={() => handleMarkAsRead(notif._id)}
                            sx={{ backgroundColor: notif.read ? 'transparent' : 'action.hover', whiteSpace: 'normal' }}
                        >
                            <ListItemText
                                primary={notif.message}
                                secondary={new Date(notif.createdAt).toLocaleString()}
                            />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </div>
    );
};

export default NotificationBell;