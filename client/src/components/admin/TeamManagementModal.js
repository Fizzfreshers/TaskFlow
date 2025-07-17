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
        if (open) {
            setCurrentTeam(team);
            setLeaderToSet(team.leader?._id || '');
        }
    }, [team, open]);

    const handleAddMember = async () => {
        if (!userToAdd) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // **FIXED**: Using the correct /api/teams endpoint
            const { data } = await axios.post(`http://localhost:5000/api/teams/${currentTeam._id}/members`, { userId: userToAdd }, config);
            
            // The backend now returns a fully populated team object, we can just use that.
            setCurrentTeam(data);
            setUserToAdd('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // **FIXED**: Using the correct /api/teams endpoint
                await axios.delete(`http://localhost:5000/api/teams/${currentTeam._id}/members/${memberId}`, config);
                
                const updatedMembers = currentTeam.members.filter(m => m._id !== memberId);
                // Also update the leader if the removed member was the leader
                const newLeaderId = currentTeam.leader?._id === memberId ? (updatedMembers[0]?._id || '') : currentTeam.leader?._id;
                
                setCurrentTeam({ ...currentTeam, members: updatedMembers, leader: { _id: newLeaderId } });
                setLeaderToSet(newLeaderId);
                
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to remove member');
            }
        }
    };
    
    const handleSetLeader = async (e) => {
        const newLeaderId = e.target.value;
        setLeaderToSet(newLeaderId);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // **FIXED**: Using the correct /api/teams endpoint
            await axios.put(`http://localhost:5000/api/teams/${currentTeam._id}/leader`, { userId: newLeaderId }, config);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to set leader');
        }
    };
    
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" gutterBottom>Manage Team: {currentTeam.name}</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="leader-select-label">Set Team Leader</InputLabel>
                    <Select labelId="leader-select-label" value={leaderToSet} label="Set Team Leader" onChange={handleSetLeader}>
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