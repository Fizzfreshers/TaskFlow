import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Divider } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const UserSidebar = () => {
    const [teamsWithUsers, setTeamsWithUsers] = useState([]);
    const { token } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const fetchTeamsWithUsers = async () => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/teams', config);
            setTeamsWithUsers(data);
        } catch (error) {
            console.error('Error fetching teams with users:', error);
        }
    };

    useEffect(() => {
        fetchTeamsWithUsers();
    }, [token]);

    useEffect(() => {
        if (socket) {
            const handleUserStatusChange = ({ userId, isOnline }) => {
                setTeamsWithUsers(prevTeams =>
                    prevTeams.map(team => ({
                        ...team,
                        members: team.members.map(member =>
                            member._id === userId ? { ...member, isOnline } : member
                        )
                    }))
                );
            };

            socket.on('userStatusChange', handleUserStatusChange);
            return () => socket.off('userStatusChange', handleUserStatusChange);
        }
    }, [socket, teamsWithUsers]);


    return (
        <Box sx={{ width: 300, borderLeft: '1px solid #ddd', height: '100vh', p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Users & Teams
            </Typography>
            <Divider sx={{ mb: 2 }}/>
            {teamsWithUsers.map(team => (
                <Box key={team._id} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon sx={{ mr: 1 }} />
                        {team.name}
                    </Typography>
                    <List dense>
                        {team.members.map(member => (
                            <ListItem key={member._id}>
                                <ListItemAvatar sx={{ minWidth: 30 }}>
                                    <OnlinePredictionIcon sx={{ fontSize: '1rem' }} color={member.isOnline ? 'success' : 'disabled'} />
                                </ListItemAvatar>
                                <ListItemText primary={member.name} />
                                {team.leader?._id === member._id && (
                                    <Chip label="Leader" color="primary" size="small" icon={<AdminPanelSettingsIcon />} />
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ))}
        </Box>
    );
};

export default UserSidebar;