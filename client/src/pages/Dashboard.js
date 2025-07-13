import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TeamList from '../components/TeamList';
import TaskCalendar from '../components/TaskCalendar';
import Modal from '../components/Modal';
import TaskDetail from '../components/TaskDetail';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleAction = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    
    const handleModalClose = () => {
        setSelectedTask(null);
        handleAction(); 
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Welcome, {user ? user.name : 'Guest'}!</h2>
            {/* You can arrange these components in a better layout, e.g., using a grid */}
            <TeamList key={`teams-${refreshTrigger}`} onTeamAction={handleAction} />
            <TaskForm key={`form-${refreshTrigger}`} onTaskCreated={handleAction} onTaskUpdated={handleAction}/>
            <TaskList key={`list-${refreshTrigger}`} onTaskClick={setSelectedTask} />
            <TaskCalendar key={`calendar-${refreshTrigger}`} />
            
            {/* --- Render the modal if a task is selected --- */}
            {selectedTask && (
                <Modal onClose={handleModalClose}>
                    <TaskDetail task={selectedTask} />
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;