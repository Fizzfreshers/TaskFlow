import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext); // Ensure token is available

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get('http://localhost:5000/api/tasks', config);
            setTasks(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTasks();
        }
    }, [token]);

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, config);
                setTasks(tasks.filter(task => task._id !== taskId)); // Remove from UI
                alert('Task deleted successfully!');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete task');
                console.error(err);
            }
        }
    };

    // Add an update handler later
    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus }, config);
            setTasks(tasks.map(task => task._id === taskId ? data : task)); // Update task in UI
            alert('Task status updated!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update task status');
            console.error(err);
        }
    };


    if (loading) return <div>Loading tasks...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h3>My Tasks</h3>
            {tasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <ul>
                    {tasks.map((task) => (
                        <li key={task._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <p>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</p>
                            <p>Status: {task.status}</p>
                            <p>Assigned To: {task.assignedTo.map(u => u.username).join(', ')}</p>
                            <p>Team: {task.team ? task.team.name : 'N/A'}</p>
                            <button onClick={() => handleDelete(task._id)}>Delete</button>
                            <select
                                value={task.status}
                                onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                                style={{ marginLeft: '10px' }}
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TaskList;