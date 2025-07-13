import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import TaskList from '../components/TaskList';
import TeamList from '../components/TeamList';
import TaskCalendar from '../components/TaskCalendar';
import TaskForm from '../components/TaskForm';
import TaskDetail from '../components/TaskDetail';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 600, md: 700 },
    bgcolor: 'background.paper',
    border: '1px solid #ddd',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto'
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [taskToView, setTaskToView] = useState(null);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

    const handleAction = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTaskClick = (task) => {
        setTaskToView(task);
    };

    const handleViewModalClose = () => {
        setTaskToView(null);
    };

    const handleFormModalClose = () => {
        setIsTaskFormOpen(false);
        handleAction(); // Refresh lists after closing form
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                 <Typography variant="h4" gutterBottom>
                    Welcome, {user ? user.name : 'Guest'}!
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsTaskFormOpen(true)}>
                    New Task
                </Button>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                     <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <TaskList key={`list-${refreshTrigger}`} onTaskClick={handleTaskClick} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TeamList key={`teams-${refreshTrigger}`} onTeamAction={handleAction} />
                        <TaskCalendar key={`calendar-${refreshTrigger}`} onTaskClick={handleTaskClick} />
                    </Paper>
                </Grid>
            </Grid>

            {/* Task Detail Modal */}
            <Modal open={!!taskToView} onClose={handleViewModalClose}>
                <Box sx={modalStyle}>
                    <TaskDetail task={taskToView} />
                </Box>
            </Modal>

            {/* Task Form Modal */}
            <Modal open={isTaskFormOpen} onClose={handleFormModalClose}>
                 <Box sx={modalStyle}>
                    <TaskForm onTaskCreated={handleFormModalClose} onTaskUpdated={handleFormModalClose} />
                </Box>
            </Modal>
        </Box>
    );
};

export default Dashboard;