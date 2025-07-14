import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { Box, Typography, Select, MenuItem, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const { token } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    useEffect(() => {
        if (socket) {
            socket.on('userStatusChange', ({ userId, isOnline }) => {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId ? { ...user, isOnline } : user
                    )
                );
            });
            return () => socket.off('userStatusChange');
        }
    }, [socket]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
        } catch (error) {
            alert('Failed to update role.');
            console.error("Role update error:", error);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 250 },
        {
            field: 'role', headerName: 'Role', width: 150,
            renderCell: (params) => (
                <Select value={params.value} onChange={(e) => handleRoleChange(params.id, e.target.value)} size="small" sx={{ width: '100%' }}>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="team-leader">Team Leader</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                </Select>
            ),
        },
        {
            field: 'isOnline', headerName: 'Status', width: 120,
            renderCell: (params) => (
                <Chip icon={<OnlinePredictionIcon />} label={params.value ? 'Online' : 'Offline'} color={params.value ? 'success' : 'default'} size="small" />
            ),
        },
        { field: 'id', headerName: 'User ID', width: 220 },
    ];

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <Typography variant="h6" gutterBottom>User Management</Typography>
            <DataGrid
                rows={users.map(u => ({ ...u, id: u._id }))}
                columns={columns}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                pageSizeOptions={[5]}
                checkboxSelection
            />
        </Box>
    );
};

export default UserManagement;