import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Divider, TextField, Button, IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DeleteIcon from '@mui/icons-material/Delete';

const TeamList = ({ onTeamAction }) => {
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const { token, user } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const fetchTeams = async () => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/teams', config);
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [token, onTeamAction]);

    useEffect(() => {
        if (socket) {
            socket.on('userStatusChange', ({ userId, isOnline }) => {
                setTeams(prevTeams =>
                    prevTeams.map(team => ({
                        ...team,
                        members: team.members.map(member =>
                            member._id === userId ? { ...member, isOnline } : member
                        )
                    }))
                );
            });
            return () => socket.off('userStatusChange');
        }
    }, [socket]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/teams', { name: newTeamName }, { headers: { Authorization: `Bearer ${token}` } });
            setNewTeamName('');
            onTeamAction(); // This will trigger a re-fetch in useEffect
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create team');
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm('Are you sure you want to permanently delete this team?')) {
            try {
                await axios.delete(`http://localhost:5000/api/teams/${teamId}`, { headers: { Authorization: `Bearer ${token}` } });
                onTeamAction();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete team');
            }
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Teams</Typography>
            {user.role === 'admin' && (
                <Box component="form" onSubmit={handleCreateTeam} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField size="small" label="New Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required sx={{ flexGrow: 1 }} />
                    <Button type="submit" variant="contained">Create</Button>
                </Box>
            )}
            <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: '30vh', overflowY: 'auto' }}>
                {teams.map((team, index) => (
                    <React.Fragment key={team._id}>
                        <ListItem
                            secondaryAction={
                                user.role === 'admin' ? (
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTeam(team._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                ) : null
                            }
                        >
                            <ListItemAvatar><Avatar><GroupIcon /></Avatar></ListItemAvatar>
                            <ListItemText
                                primary={team.name}
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                        {team.members.map(member => (
                                            <Box key={member._id} component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <OnlinePredictionIcon sx={{ mr: 0.5, fontSize: '1rem' }} color={member.isOnline ? 'success' : 'disabled'} />
                                                <Typography variant="caption">{member.name}</Typography>
                                                {team.leader?._id === member._id && (
                                                    <Chip label="Leader" color="primary" size="small" sx={{ ml: 1 }} icon={<AdminPanelSettingsIcon />} />
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                }
                            />
                        </ListItem>
                        {index < teams.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default TeamList;