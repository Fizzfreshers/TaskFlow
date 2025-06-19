import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard'; // Create this later
import Header from './components/Header'; // Create this later

const App = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading app...</div>; // Or a spinner
    }

    return (
        <Router>
            <Header /> {/* Will contain logout button */}
            <Routes>
                <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
                <Route
                    path="/dashboard"
                    element={user ? <Dashboard /> : <Navigate to="/auth" />}
                />
                <Route path="/" element={<Navigate to="/dashboard" />} /> {/* Default route */}
            </Routes>
        </Router>
    );
};

export default App;