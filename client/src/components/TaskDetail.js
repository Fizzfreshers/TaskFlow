import React from 'react';
import { Box, Typography, Divider, Chip, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

const statusColors = {
    pending: 'warning',
    'in-progress': 'info',
    completed: 'success',
};

const TaskDetail = ({ task }) => {
    if (!task) return null;

    return (
        <Box>
            <Typography id="task-detail-title" variant="h4" gutterBottom>{task.title}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Chip label={task.status} color={statusColors[task.status]} sx={{ textTransform: 'capitalize' }} />
                <Typography variant="body1">
                    <strong>Deadline:</strong> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="h6">Description</Typography>
            <Typography id="task-detail-description" paragraph>{task.description || 'No description provided.'}</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="h6">Assigned To</Typography>
            <List>
                {task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo.map(user => (
                    <ListItem key={user._id}>
                        <ListItemAvatar><Avatar><PersonIcon /></Avatar></ListItemAvatar>
                        <ListItemText primary={user.name} secondary={user.email} />
                    </ListItem>
                )) : <ListItem><ListItemText primary="No individual users assigned." /></ListItem>}
            </List>

            <Typography variant="h6">Assigned Teams</Typography>
            <List>
                 {task.teams && task.teams.length > 0 ? task.teams.map(team => (
                    <ListItem key={team._id}>
                        <ListItemAvatar><Avatar><GroupIcon /></Avatar></ListItemAvatar>
                        <ListItemText primary={team.name} />
                    </ListItem>
                )) : <ListItem><ListItemText primary="No teams assigned." /></ListItem>}
            </List>
        </Box>
    );
};

export default TaskDetail;