import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    return (
        <div>
            <h2>Welcome, {user ? user.username : 'Guest'}!</h2>
            <p>This is your collaborative task manager dashboard.</p>
            {/* Task management features will go here */}
        </div>
    );
};

export default Dashboard;