import React, { useContext, useState, useEffect } from 'react';

import axios from 'axios';

import { AuthContext } from '../context/AuthContext';

import TeamManagementModal from '../components/admin/TeamManagementModal'; // Import the modal

import TaskList from '../components/TaskList';

import TeamList from '../components/TeamList';

import TaskCalendar from '../components/TaskCalendar';

import TaskForm from '../components/TaskForm';

import TaskDetail from '../components/TaskDetail';

import UserSidebar from '../components/UserSidebar';

import { Modal, Box, Grid, Paper, Typography, Button } from '@mui/material';

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

    const { user, token } = useContext(AuthContext);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [taskToView, setTaskToView] = useState(null);

    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

   

    // *** NEW: State for Team Management Modal ***

    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

    const [selectedTeam, setSelectedTeam] = useState(null);

    const [allUsers, setAllUsers] = useState([]);


    // *** NEW: Fetch all users for the modal ***

    useEffect(() => {

        const fetchAllUsers = async () => {

            if (!token) return;

            try {

                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Using the admin route to get all users, as team leaders need this list

                const { data } = await axios.get('http://localhost:5000/api/admin/users', config);

                setAllUsers(data);

            } catch (error) {

                console.error("Failed to fetch all users:", error);

            }

        };

        // Only fetch if the user is an admin or team-leader

        if (user && (user.role === 'admin' || user.role === 'team-leader')) {

            fetchAllUsers();

        }

    }, [token, user]);


    const handleAction = () => setRefreshTrigger(prev => prev + 1);

    const handleTaskClick = (task) => setTaskToView(task);

    const handleViewModalClose = () => setTaskToView(null);

    const handleFormModalClose = () => {

        setIsTaskFormOpen(false);

        handleAction();

    };


    // *** NEW: Handlers for Team Management Modal ***

    const handleOpenTeamModal = (team) => {

        setSelectedTeam(team);

        setIsTeamModalOpen(true);

    };


    const handleCloseTeamModal = () => {

        setSelectedTeam(null);

        setIsTeamModalOpen(false);

        handleAction(); // Refresh lists after closing

    };


    return (
        
        <Box sx={{ display: 'flex' }}>

            <Box sx={{ flexGrow: 1, p: 3 }}>

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

                             {/* Pass the new handler to TeamList */}

                            <TeamList key={`teams-${refreshTrigger}`} onManageTeam={handleOpenTeamModal} onTeamAction={handleAction} />

                            <TaskCalendar key={`calendar-${refreshTrigger}`} onTaskClick={handleTaskClick} />

                        </Paper>

                    </Grid>

                </Grid>

            </Box>


            <UserSidebar />

           

            {/* Task Detail Modal */}

            <Modal open={!!taskToView} onClose={handleViewModalClose}>

                <Box sx={modalStyle}><TaskDetail task={taskToView} /></Box>

            </Modal>


            {/* Task Form Modal */}

            <Modal open={isTaskFormOpen} onClose={handleFormModalClose}>

                <Box sx={modalStyle}><TaskForm onTaskCreated={handleFormModalClose} onTaskUpdated={handleFormModalClose} /></Box>

            </Modal>

           

            {/* *** NEW: Team Management Modal *** */}

            {isTeamModalOpen && selectedTeam && (

                <TeamManagementModal

                    open={isTeamModalOpen}

                    onClose={handleCloseTeamModal}

                    team={selectedTeam}

                    allUsers={allUsers}

                />

            )}

        </Box>

    );

};


export default Dashboard;