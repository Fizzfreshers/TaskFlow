import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TaskForm = ({ onTaskCreated, currentTask, onTaskUpdated }) => {
    const [title, setTitle] = useState(currentTask ? currentTask.title : '');
    const [description, setDescription] = useState(currentTask ? currentTask.description : '');
    const [deadline, setDeadline] = useState(currentTask ? (new Date(currentTask.deadline).toISOString().split('T')[0]) : ''); // format for input type="date"
    const [assignedTo, setAssignedTo] = useState(currentTask ? currentTask.assignedTo.map(u => u._id) : []); // store IDs
    const [team, setTeam] = useState(currentTask ? currentTask.team._id : ''); // store team ID
    const [users, setUsers] = useState([]); // for dropdown of users
    const [teams, setTeams] = useState([]); // for dropdown of teams

    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsersAndTeams = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                // Assume you'll have an API to get all users and teams for assignment later
                // For now, let's hardcode or fetch a limited list
                const { data: usersData } = await axios.get('http://localhost:5000/api/users', config); // Need to create this endpoint
                setUsers(usersData);

                const { data: teamsData } = await axios.get('http://localhost:5000/api/teams', config); // Need to create this endpoint
                setTeams(teamsData);

            } catch (error) {
                console.error("Failed to fetch users or teams for form:", error);
                alert("Could not load users or teams for assignment.");
            }
        };
        if (token) fetchUsersAndTeams();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = { title, description, deadline, assignedTo, team };
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            if (currentTask) {
                const { data } = await axios.put(`http://localhost:5000/api/tasks/${currentTask._id}`, taskData, config);
                alert('Task updated successfully!');
                onTaskUpdated(data); // Callback to update parent state
            } else {
                const { data } = await axios.post('http://localhost:5000/api/tasks', taskData, config);
                alert('Task created successfully!');
                onTaskCreated(data); // Callback to add to parent state
                setTitle(''); // Clear form
                setDescription('');
                setDeadline('');
                setAssignedTo([]);
                setTeam('');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save task');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #eee', padding: '20px', margin: '20px 0' }}>
            <h3>{currentTask ? 'Edit Task' : 'Create New Task'}</h3>
            <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
            />
            <select multiple value={assignedTo} onChange={(e) => setAssignedTo(Array.from(e.target.selectedOptions, option => option.value))}>
                <option value="">Assign to (select multiple)</option>
                {users.map(u => (
                    <option key={u._id} value={u._id}>{u.username}</option>
                ))}
            </select>
            <select value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="">Select Team (optional)</option>
                {teams.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                ))}
            </select>
            <button type="submit">{currentTask ? 'Update Task' : 'Add Task'}</button>
        </form>
    );
};

export default TaskForm;