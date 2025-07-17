import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Chip, OutlinedInput } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const TaskForm = ({ task, onTaskCreated, onTaskUpdated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState(null);
    const [assignedTo, setAssignedTo] = useState([]);
    const [assignedTeams, setAssignedTeams] = useState([]);

    const { user, token } = useContext(AuthContext);
    const [allTeams, setAllTeams] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [manageableUsers, setManageableUsers] = useState([]);

    useEffect(() => {
        // Fetch all teams and users for the dropdowns
        const fetchData = async () => {
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const [teamsRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/teams', config),
                    axios.get('http://localhost:5000/api/users', config)
                ]);
                setAllTeams(teamsRes.data);
                setAllUsers(usersRes.data);

                // Determine which users are manageable based on role
                if (user.role === 'admin') {
                    setManageableUsers(usersRes.data);
                } else if (user.role === 'team-leader') {
                    const leaderTeams = teamsRes.data.filter(t => t.leader?._id === user._id);
                    const memberIds = new Set(leaderTeams.flatMap(t => t.members.map(m => m._id)));
                    setManageableUsers(usersRes.data.filter(u => memberIds.has(u._id)));
                }

            } catch (error) {
                console.error("Failed to fetch data for task form", error);
            }
        };
        fetchData();

        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setDeadline(new Date(task.deadline));
            setAssignedTo(task.assignedTo.map(u => u._id));
            setAssignedTeams(task.teams.map(t => t._id));
        }
    }, [task, token, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = { title, description, deadline, assignedTo, teams: assignedTeams };
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            if (task) {
                await axios.put(`http://localhost:5000/api/tasks/${task._id}`, taskData, config);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                await axios.post('http://localhost:5000/api/tasks', taskData, config);
                if (onTaskCreated) onTaskCreated();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'An error occurred.');
            console.error(error);
        }
    };

    const canAssignToIndividuals = user.role === 'admin' || user.role === 'team-leader';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography variant="h5" sx={{ mb: 2 }}>{task ? 'Edit Task' : 'Create New Task'}</Typography>
                <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required margin="normal" />
                <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={4} margin="normal" />
                <DateTimePicker label="Deadline" value={deadline} onChange={setDeadline} sx={{ width: '100%', mt: 2, mb: 1 }} />
                
                <FormControl fullWidth margin="normal">
                    <InputLabel id="teams-select-label">Assign to Team(s)</InputLabel>
                    <Select
                        labelId="teams-select-label"
                        multiple value={assignedTeams}
                        onChange={(e) => setAssignedTeams(e.target.value)}
                        input={<OutlinedInput label="Assign to Team(s)" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map(id => {
                                    const team = allTeams.find(t => t._id === id);
                                    return <Chip key={id} label={team?.name || '...'} />;
                                })}
                            </Box>
                        )}
                    >
                        {allTeams.map((team) => (<MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>))}
                    </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal" disabled={!canAssignToIndividuals}>
                    <InputLabel id="users-select-label">Assign to Individual(s)</InputLabel>
                    <Select
                        labelId="users-select-label"
                        multiple value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        input={<OutlinedInput label="Assign to Individual(s)" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map(id => {
                                    const assignedUser = allUsers.find(u => u._id === id);
                                    return <Chip key={id} label={assignedUser?.name || '...'} />;
                                })}
                            </Box>
                        )}
                    >
                        {manageableUsers.map((u) => (<MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>))}
                    </Select>
                    {!canAssignToIndividuals && <Typography variant="caption" color="textSecondary">Only Admins and Team Leaders can assign to individuals.</Typography>}
                </FormControl>

                <Button type="submit" variant="contained" sx={{ mt: 3, width: '100%' }}>{task ? 'Update Task' : 'Create Task'}</Button>
            </Box>
        </LocalizationProvider>
    );
};

export default TaskForm;