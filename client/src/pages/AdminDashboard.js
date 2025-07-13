import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import UserManagement from '../components/admin/UserManagement';
import TeamManagement from '../components/admin/TeamManagement';

const AdminDashboard = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>Admin Control Panel</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <TeamManagement />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <UserManagement />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;