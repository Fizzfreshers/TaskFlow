import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Modal, Box, Typography, Select, MenuItem, Button, FormControl, InputLabel, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const modalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 }, bgcolor: 'background.paper', border: '1px solid #ddd', borderRadius: 2, boxShadow: 24, p: 4,
};

const TeamManagementModal = ({ open, onClose, team, allUsers }) => {
    const [currentTeam, setCurrentTeam] = useState(team);
    const [userToAdd, setUserToAdd] = useState('');
    const [leaderToSet, setLeaderToSet] = useState('');
    const { token } = useContext(AuthContext);

    useEffect(() => {
        // This effect ensures the modal state is fresh every time it opens.
        if (open) {
            setCurrentTeam(team);
            setLeaderToSet(team.leader?._id || '');
        }
    }, [team, open]);

    const handleAddMember = async () => {
        if (!userToAdd) return;
        try {
            // The team member routes are now on the /api/teams endpoint
            const { data } = await axios.post(`/api/teams/${team._id}/members`, { userId: userToAdd }, { headers: { Authorization: `Bearer ${token}` } });
            // The backend sends back the updated team object which we can use to refresh state
            const updatedTeamWithPopulatedMembers = { ...data, members: allUsers.filter(u => data.members.includes(u._id)) };
            setCurrentTeam(updatedTeamWithPopulatedMembers);
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
                <Typography variant="h6" gutterBottom>Manage Team: {team.name}</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="leader-select-label">Set Team Leader</InputLabel>
                    <Select labelId="leader-select-label" value={leaderToSet} label="Set Team Leader" onChange={handleSetLeader}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {currentTeam.members.map(member => (
                            <MenuItem key={member._id} value={member._id}>{member.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Typography variant="subtitle1">Members</Typography>
                <List dense sx={{ maxHeight: 150, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
                    {currentTeam.members.map(member => (
                        <ListItem key={member._id} secondaryAction={
                            <IconButton edge="end" aria-label="delete member" onClick={() => handleRemoveMember(member._id)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText primary={member.name} />
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">Add New Member</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel id="add-user-label">Select User to Add</InputLabel>
                        <Select labelId="add-user-label" value={userToAdd} label="Select User to Add" onChange={(e) => setUserToAdd(e.target.value)}>
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