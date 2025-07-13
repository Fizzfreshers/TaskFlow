import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import TaskIcon from '@mui/icons-material/Task';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <TaskIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    TaskFlow
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {user ? (
                        <>
                            <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
                                Welcome, {user.name}
                            </Typography>

                            {user.role === 'admin' && (
                                <Button
                                    color="inherit"
                                    component={RouterLink}
                                    to="/admin"
                                    startIcon={<AdminPanelSettingsIcon />}
                                >
                                    Admin Panel
                                </Button>
                            )}

                            <NotificationBell />

                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button color="inherit" component={RouterLink} to="/auth">
                            Login / Register
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;