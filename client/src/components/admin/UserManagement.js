import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { Box, Typography, Select, MenuItem, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';

const UserManagement = ({ key: refreshKey }) => {
    const [users, setUsers] = useState([]);
    const { token } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const fetchUsers = async () => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token, refreshKey]);

    useEffect(() => {
        if (socket) {
            const handleUserStatusChange = ({ userId, isOnline }) => {
                // Use a functional update to prevent stale state issues
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId ? { ...user, isOnline } : user
                    )
                );
            };
            socket.on('userStatusChange', handleUserStatusChange);
            
            return () => socket.off('userStatusChange', handleUserStatusChange);
        }
    }, [socket]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole }, config);
            // We fetch users again to ensure the data is fresh from the server
            fetchUsers();
            alert('User role updated successfully!');
        } catch (error) {
            alert('Failed to update role.');
            console.error(error);
        }
    };

    // Correct columns array that includes the Role column
    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        {
            field: 'isOnline',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    icon={<OnlinePredictionIcon />}
                    label={params.value ? 'Online' : 'Offline'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 150,
            editable: true,
            type: 'singleSelect',
            valueOptions: ['user', 'team-leader', 'admin'],
        },
        {
            field: 'teams',
            headerName: 'Teams',
            flex: 1,
            minWidth: 200,
            // FIX: Map over the populated teams array and join their names
            valueGetter: (value, row) => 
                (row.teams && row.teams.length > 0)
                    ? row.teams.map((team) => team.name).join(', ')
                    : 'No Teams',
        }
    ];
    
    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <Typography variant="h6" gutterBottom>User Management</Typography>
            <DataGrid
                rows={users}
                columns={columns}
                getRowId={(row) => row._id}
                initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                }}
                pageSizeOptions={[5]}
                disableRowSelectionOnClick
                // This function saves the role change when you edit the cell
                processRowUpdate={(newRow) => {
                    handleRoleChange(newRow._id, newRow.role);
                    return newRow;
                }}
            />
        </Box>
    );
};

export default UserManagement;