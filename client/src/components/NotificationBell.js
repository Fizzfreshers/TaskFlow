import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { IconButton, Badge, Menu, MenuItem, ListItemText, ListItemSecondaryAction, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const { token } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const { data } = await axios.get('http://localhost:5000/api/notifications', config);
                setNotifications(data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };
        fetchNotifications();
    }, [token]);

    useEffect(() => {
        if (socket) {
            const handleNewNotification = (newNotification) => {
                setNotifications(prev => [newNotification, ...prev]);
            };
            socket.on('newNotification', handleNewNotification);
            return () => socket.off('newNotification', handleNewNotification);
        }
    }, [socket]);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const markAsRead = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put('http://localhost:5000/api/notifications/mark-read', {}, config);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/notifications/${id}`, config);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} onOpen={markAsRead}>
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <MenuItem key={n._id} sx={{ whiteSpace: 'normal' }}>
                            <ListItemText primary={n.message} secondary={new Date(n.createdAt).toLocaleString()} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => deleteNotification(n._id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem><Typography>No new notifications</Typography></MenuItem>
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;