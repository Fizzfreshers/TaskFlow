import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import TaskList from '../components/TaskList';
import TeamList from '../components/TeamList';
import TaskCalendar from '../components/TaskCalendar';
import Modal from '@mui/material/Modal'; // Using MUI's Modal
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TaskDetail from '../components/TaskDetail';

// Style for the modal content
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleAction = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleModalClose = () => {
        setSelectedTask(null);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
                Welcome, {user ? user.name : 'Guest'}!
            </Typography>
            <Grid container spacing={3}>
                {/* Left Column: Teams & Calendar */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TeamList key={`teams-${refreshTrigger}`} onTeamAction={handleAction} />
                        <TaskCalendar key={`calendar-${refreshTrigger}`} onTaskClick={handleTaskClick} />
                    </Paper>
                </Grid>
                
                {/* Right Column: Tasks List */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <TaskList key={`list-${refreshTrigger}`} onTaskClick={handleTaskClick} />
                    </Paper>
                </Grid>
            </Grid>

            {/* Task Detail Modal */}
            <Modal
                open={!!selectedTask}
                onClose={handleModalClose}
                aria-labelledby="task-detail-title"
                aria-describedby="task-detail-description"
            >
                <Box sx={modalStyle}>
                    <TaskDetail task={selectedTask} />
                </Box>
            </Modal>
        </Box>
    );
};

export default Dashboard;