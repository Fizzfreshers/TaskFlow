import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, List, Card, CardContent, CardActions, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';

const TaskList = ({ onTaskClick }) => {
    const [tasks, setTasks] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [filterByTeam, setFilterByTeam] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                setLoading(true);
                setError(null);
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const [tasksRes, teamsRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/tasks', config),
                        axios.get('http://localhost:5000/api/teams', config)
                    ]);
                    setTasks(tasksRes.data);
                    setAllTeams(teamsRes.data);
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to fetch data');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [token]);

    const handleDelete = async (taskId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
                setTasks(tasks.filter(task => task._id !== taskId));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete task');
            }
        }
    };

    const handleUpdateStatus = async (taskId, newStatus, e) => {
        e.stopPropagation();
        try {
            const { data } = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setTasks(tasks.map(task => task._id === taskId ? data : task));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredTasks = filterByTeam
        ? tasks.filter(task => task.teams.some(team => team._id === filterByTeam))
        : tasks;

    if (loading) return <div>Loading tasks...</div>;
    if (error) return <div>Error: {error}</div>;

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>My Tasks</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Filter by Team</InputLabel>
                <Select value={filterByTeam} label="Filter by Team" onChange={(e) => setFilterByTeam(e.target.value)}>
                    <MenuItem value=""><em>All Teams</em></MenuItem>
                    {allTeams.map(team => <MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>)}
                </Select>
            </FormControl>

            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {filteredTasks.length === 0 ? (
                    <Typography>No tasks found for the selected filter.</Typography>
                ) : (
                    filteredTasks.map((task) => (
                        <Card key={task._id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => onTaskClick(task)}>
                            <CardContent>
                                <Typography variant="h6">{task.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Teams: {task.teams.map(t => t.name).join(', ')}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between' }}>
                                <FormControl size="small" sx={{ m: 1, minWidth: 120 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={task.status}
                                        label="Status"
                                        onChange={(e) => handleUpdateStatus(task._id, e.target.value, e)}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="in-progress">In Progress</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button size="small" color="error" onClick={(e) => handleDelete(task._id, e)}>Delete</Button>
                            </CardActions>
                        </Card>
                    ))
                )}
            </List>
        </Box>
    );
};

export default TaskList;