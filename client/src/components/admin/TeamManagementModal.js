import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Modal, Box, Typography, Select, MenuItem, Button, FormControl, InputLabel, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const modalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const TeamManagementModal = ({ open, onClose, team, allUsers }) => {
    const [currentTeam, setCurrentTeam] = useState(team);
    const [userToAdd, setUserToAdd] = useState('');
    const [leaderToSet, setLeaderToSet] = useState(team.leader?._id || '');
    const { token } = useContext(AuthContext);

    useEffect(() => {
        setCurrentTeam(team);
        setLeaderToSet(team.leader?._id || '');
    }, [team]);

    const handleAddMember = async () => {
        if (!userToAdd) return;
        try {
            const { data } = await axios.post(`/api/teams/${team._id}/members`, { userId: userToAdd }, { headers: { Authorization: `Bearer ${token}` } });
            setCurrentTeam(data);
            setUserToAdd('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await axios.delete(`/api/teams/${team._id}/members/${memberId}`, { headers: { Authorization: `Bearer ${token}` } });
            const updatedMembers = currentTeam.members.filter(m => m._id !== memberId);
            setCurrentTeam({ ...currentTeam, members: updatedMembers });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove member');
        }
    };
    
    const handleSetLeader = async (e) => {
        const newLeaderId = e.target.value;
        setLeaderToSet(newLeaderId);
        try {
            await axios.put(`/api/teams/${team._id}/leader`, { userId: newLeaderId }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to set leader');
        }
    };
    
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6">Manage Team: {team.name}</Typography>
                <FormControl fullWidth sx={{ my: 2 }}>
                    <InputLabel>Set Team Leader</InputLabel>
                    <Select value={leaderToSet} label="Set Team Leader" onChange={handleSetLeader}>
                        {currentTeam.members.map(member => (
                            <MenuItem key={member._id} value={member._id}>{member.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Typography variant="subtitle1">Members</Typography>
                <List>
                    {currentTeam.members.map(member => (
                        <ListItem key={member._id} secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemoveMember(member._id)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText primary={member.name} />
                        </ListItem>
                    ))}
                </List>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Add New Member</InputLabel>
                        <Select value={userToAdd} label="Add New Member" onChange={(e) => setUserToAdd(e.target.value)}>
                            {allUsers.filter(u => !currentTeam.members.some(m => m._id === u._id)).map(user => (
                                <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button onClick={handleAddMember} variant="contained">Add</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default TeamManagementModal;