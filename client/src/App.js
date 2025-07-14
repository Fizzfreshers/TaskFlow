import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import { Container, CircularProgress, Box, CssBaseline } from '@mui/material';

const App = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Router>
            <CssBaseline />
            <Header />
            <Container maxWidth="xl" component="main" sx={{ mt: 4, mb: 4 }}>
                <Routes>
                    <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
                    {/* THIS IS THE PROTECTED ROUTE FOR THE ADMIN PANEL */}
                    <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Container>
        </Router>
    );
};

export default App;