import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TaskForm = ({ onTaskCreated, currentTask, onTaskUpdated }) => {
    const [title, setTitle] = useState(currentTask ? currentTask.title : '');
    const [description, setDescription] = useState(currentTask ? currentTask.description : '');
    const [deadline, setDeadline] = useState(currentTask && currentTask.deadline ? (new Date(currentTask.deadline).toISOString().split('T')[0]) : '');
    const [assignedTo, setAssignedTo] = useState(currentTask ? currentTask.assignedTo.map(u => u._id) : []);
    const [selectedTeams, setSelectedTeams] = useState(currentTask ? currentTask.teams.map(t => t._id) : []);
    
    const [users, setUsers] = useState([]);
    const [allTeams, setAllTeams] = useState([]);

    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (currentTask) {
            setTitle(currentTask.title);
            setDescription(currentTask.description || '');
            setDeadline(currentTask.deadline ? new Date(currentTask.deadline).toISOString().split('T')[0] : '');
            setAssignedTo(currentTask.assignedTo.map(u => u._id));
            setSelectedTeams(currentTask.teams.map(t => t._id));
        }
    }, [currentTask]);

    useEffect(() => {
        const fetchUsersAndTeams = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [usersRes, teamsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users', config),
                    axios.get('http://localhost:5000/api/teams', config)
                ]);
                setUsers(usersRes.data);
                setAllTeams(teamsRes.data);
            } catch (error) {
                console.error("Failed to fetch users or teams for form:", error);
            }
        };
        if (token) fetchUsersAndTeams();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = { title, description, deadline, assignedTo, teams: selectedTeams };
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (currentTask) {
                const { data } = await axios.put(`http://localhost:5000/api/tasks/${currentTask._id}`, taskData, config);
                onTaskUpdated(data);
            } else {
                const { data } = await axios.post('http://localhost:5000/api/tasks', taskData, config);
                onTaskCreated(data);
                setTitle('');
                setDescription('');
                setDeadline('');
                setAssignedTo([]);
                setSelectedTeams([]);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save task');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #eee', padding: '20px', margin: '20px 0' }}>
            <h3>{currentTask ? 'Edit Task' : 'Create New Task'}</h3>
            {/* ... other inputs ... */}
            <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

            <p>Assign to Users (Ctrl+Click for multiple):</p>
            <select multiple value={assignedTo} onChange={(e) => setAssignedTo(Array.from(e.target.selectedOptions, option => option.value))}>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            
            <p>Assign to Teams (Ctrl+Click for multiple):</p>
            <select multiple value={selectedTeams} onChange={(e) => setSelectedTeams(Array.from(e.target.selectedOptions, option => option.value))}>
                {allTeams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            
            <button type="submit">{currentTask ? 'Update Task' : 'Add Task'}</button>
        </form>
    );
};

export default TaskForm;