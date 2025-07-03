import React, { useContext,useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TeamList from '../components/TeamList';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [refreshTasks, setRefreshTasks] = useState(0); // to trigger task list refresh
    const [refreshTeams, setRefreshTeams] = useState(0); // State to trigger team list refresh
    const handleTaskCreated = (newTask) => {
        // You might want to add newTask to the tasks state directly, or
        // simplest for now is to trigger a re-fetch of all tasks.
        setRefreshTasks(prev => prev + 1);
    };
    const handleTaskUpdated = (updatedTask) => {
        setRefreshTasks(prev => prev + 1);
    }
    const handleTeamAction = () => {
        setRefreshTeams(prev => prev + 1); // Trigger refresh of teams
        setRefreshTasks(prev => prev + 1); // Also refresh tasks as team membership changes
    };
    return (
        <div style={{ padding: '20px' }}>
            <h2>Welcome, {user ? user.name : 'Guest'}!</h2>
            <TaskForm onTaskCreated={handleTaskCreated} />
            <TaskList key={refreshTasks} /> {/* Use key to force re-render/re-fetch */}
        </div>
    );
};

export default Dashboard;