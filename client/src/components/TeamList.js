import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Divider, TextField, Button } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';

const TeamList = ({ onTeamAction }) => {
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const { token, user } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const fetchTeams = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/teams', config);
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTeams();
        }
    }, [token]);

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

            return () => {
                socket.off('userStatusChange');
            };
        }
    }, [socket]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/teams', { name: newTeamName }, config);
            setNewTeamName('');
            fetchTeams();
            onTeamAction();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create team');
        }
    };
    
    const handleDeleteTeam = async (teamId) => {
    }
    
    const renderAdminControls = () => {
        if (user && user.role === 'admin') {
            return (
                <form onSubmit={handleCreateTeam}>
                    <input type="text" placeholder="New Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required/>
                    <button type="submit">Create Team</button>
                </form>
            );
        }
        return null;
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Your Teams</Typography>
            { user.role === 'admin' && (
                <Box component="form" onSubmit={handleCreateTeam} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField size="small" label="New Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required />
                    <Button type="submit" variant="contained">Create</Button>
                </Box>
            )}
            
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {teams.map((team) => (
                    <React.Fragment key={team._id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar><GroupIcon /></Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={team.name}
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography component="span" variant="body2">
                                            Leader: {team.leader ? team.leader.name : 'None'}
                                        </Typography>
                                        {team.members.map(member => (
                                            <Box key={member._id} component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <OnlinePredictionIcon sx={{ mr: 0.5, fontSize: '1rem' }} color={member.isOnline ? 'success' : 'disabled'} />
                                                <Typography variant="caption">{member.name}</Typography>
                                                {team.leader && team.leader._id === member._id && (
                                                    <Chip label="Leader" color="primary" size="small" sx={{ ml: 1 }}/>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                }
                            />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default TeamList;