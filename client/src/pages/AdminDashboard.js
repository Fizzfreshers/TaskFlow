import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Container, Typography, Grid, Paper, TextField, Button, Box,
    Select, MenuItem, InputLabel, FormControl, Chip, OutlinedInput, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserManagement from '../components/admin/UserManagement';
import TeamManagement from '../components/admin/TeamManagement';

const AdminDashboard = () => {
    const { token } = useContext(AuthContext);
    const [newTeamName, setNewTeamName] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchUsers = async () => {
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
            setAllUsers(data.filter(u => u.role === 'user'));
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, [token, refreshKey]);

    const handleCreateTeam = async () => {
        if (!newTeamName || selectedUsers.length === 0) {
            alert('Please provide a team name and select at least one member.');
            return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.post('http://localhost:5000/api/teams', {
                name: newTeamName,
                members: selectedUsers
            }, config);
            alert('Team created successfully!');
            setNewTeamName('');
            setSelectedUsers([]);
            setRefreshKey(prevKey => prevKey + 1); // This will trigger a re-fetch in TeamManagement and UserManagement
        } catch (error) {
            console.error('Error creating team:', error);
            alert('Failed to create team. ' + (error.response?.data?.message || ''));
        }
    };
    
    const handleUserSelection = (event) => {
        const { target: { value } } = event;
        setSelectedUsers(typeof value === 'string' ? value.split(',') : value);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton component={Link} to="/dashboard" sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
                    Admin Dashboard
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6">Create New Team</Typography>
                        <TextField
                            label="New Team Name"
                            variant="outlined"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="select-members-label">Initial Members</InputLabel>
                            <Select
                                labelId="select-members-label"
                                multiple
                                value={selectedUsers}
                                onChange={handleUserSelection}
                                input={<OutlinedInput id="select-multiple-chip" label="Initial Members" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((userId) => {
                                            const user = allUsers.find(u => u._id === userId);
                                            return <Chip key={userId} label={user ? user.name : '...'} />;
                                        })}
                                    </Box>
                                )}
                            >
                                {allUsers.map((user) => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={handleCreateTeam}>
                            Create Team
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                     {/* The TeamManagement table now has its delete functionality fixed */}
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <TeamManagement key={refreshKey} />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <UserManagement key={refreshKey} />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;