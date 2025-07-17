// client/src/components/TeamList.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Divider, IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'; // Import Manage icon

// *** MODIFIED: Added onManageTeam prop ***
const TeamList = ({ onManageTeam, onTeamAction }) => {
    const [teams, setTeams] = useState([]);
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
            // *** NEW: Listen for team updates from the server ***
            socket.on('teamUpdated', (updatedTeam) => {
                setTeams(prevTeams => prevTeams.map(t => t._id === updatedTeam._id ? updatedTeam : t));
                onTeamAction();
            });

            return () => {
                socket.off('userStatusChange');
                socket.off('teamUpdated');
            }
        }
    }, [socket, onTeamAction]);


    return (
        <Box>
            <Typography variant="h5" gutterBottom>My Teams</Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: '30vh', overflowY: 'auto' }}>
                {teams.map((team, index) => (
                    <React.Fragment key={team._id}>
                        <ListItem
                            secondaryAction={
                                // *** MODIFIED: Show Manage button for Admins or Team Leaders ***
                                (user.role === 'admin' || user._id === team.leader?._id) && (
                                    <IconButton edge="end" aria-label="manage" onClick={() => onManageTeam(team)}>
                                        <ManageAccountsIcon />
                                    </IconButton>
                                )
                            }
                        >
                            <ListItemAvatar><Avatar><GroupIcon /></Avatar></ListItemAvatar>
                            <ListItemText
                                primary={team.name}
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                        {team.members.slice(0, 5).map(member => ( // Show max 5 members for brevity
                                            <Box key={member._id} component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <OnlinePredictionIcon sx={{ mr: 0.5, fontSize: '1rem' }} color={member.isOnline ? 'success' : 'disabled'} />
                                                <Typography variant="caption">{member.name}</Typography>
                                                {team.leader?._id === member._id && (
                                                    <Chip label="Leader" color="primary" size="small" sx={{ ml: 1, height: 18 }} icon={<AdminPanelSettingsIcon sx={{fontSize: '1rem'}} />} />
                                                )}
                                            </Box>
                                        ))}
                                        {team.members.length > 5 && <Typography variant="caption">...and {team.members.length - 5} more.</Typography>}
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