import React, { useContext,useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TeamList from '../components/TeamList';
import TaskCalendar from '../components/TaskCalendar';

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
            <h2>Welcome, {user ? user.username : 'Guest'}!</h2>
            <TeamList key={refreshTeams} onTeamCreatedOrJoined={handleTeamAction} />
            <TaskForm onTaskCreated={handleTaskCreated} />
            <TaskList key={refreshTasks} />
            <TaskCalendar key={refreshTasks} /> {/* to re-fetch tasks if tasks change */}
        </div>
    );
};

export default Dashboard;