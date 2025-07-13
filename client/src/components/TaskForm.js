import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Chip, Typography, OutlinedInput } from '@mui/material';

const TaskForm = ({ onTaskCreated, onTaskUpdated, currentTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [assignedTo, setAssignedTo] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (currentTask) {
            setTitle(currentTask.title || '');
            setDescription(currentTask.description || '');
            setDeadline(currentTask.deadline ? new Date(currentTask.deadline).toISOString().split('T')[0] : '');
            setAssignedTo(currentTask.assignedTo.map(u => u._id));
            setSelectedTeams(currentTask.teams.map(t => t._id));
        }
    }, [currentTask]);

    useEffect(() => {
        const fetchUsersAndTeams = async () => {
            if (!token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [usersRes, teamsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users', config),
                    axios.get('http://localhost:5000/api/teams', config)
                ]);
                setUsers(usersRes.data);
                setAllTeams(teamsRes.data);
            } catch (error) {
                console.error("Failed to fetch users or teams for form:", error);
            }
        };
        fetchUsersAndTeams();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = { title, description, deadline, assignedTo, teams: selectedTeams };
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (currentTask) {
                const { data } = await axios.put(`http://localhost:5000/api/tasks/${currentTask._id}`, taskData, config);
                if (onTaskUpdated) onTaskUpdated(data);
            } else {
                const { data } = await axios.post('http://localhost:5000/api/tasks', taskData, config);
                if (onTaskCreated) onTaskCreated(data);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save task');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5">{currentTask ? 'Edit Task' : 'Create New Task'}</Typography>
            <TextField label="Task Title" variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <TextField label="Description" variant="outlined" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            <TextField type="date" label="Deadline" InputLabelProps={{ shrink: true }} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            
            <FormControl>
                <InputLabel>Assign to Users</InputLabel>
                <Select multiple value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} input={<OutlinedInput label="Assign to Users" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => <Chip key={value} label={users.find(u => u._id === value)?.name || ''} />)}
                        </Box>
                    )}>
                    {users.map((user) => <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>)}
                </Select>
            </FormControl>

            <FormControl>
                <InputLabel>Assign to Teams</InputLabel>
                <Select multiple value={selectedTeams} onChange={(e) => setSelectedTeams(e.target.value)} input={<OutlinedInput label="Assign to Teams" />}
                    renderValue={(selected) => (
                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => <Chip key={value} label={allTeams.find(t => t._id === value)?.name || ''} />)}
                        </Box>
                    )}>
                    {allTeams.map((team) => <MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>)}
                </Select>
            </FormControl>

            <Button type="submit" variant="contained" color="primary">{currentTask ? 'Update Task' : 'Add Task'}</Button>
        </Box>
    );
};

export default TaskForm;