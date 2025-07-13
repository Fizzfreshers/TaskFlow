import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TaskList = ({ onTaskClick }) => {
    const [tasks, setTasks] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [filterByTeam, setFilterByTeam] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                setLoading(true);
                setError(null);
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const [tasksRes, teamsRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/tasks', config),
                        axios.get('http://localhost:5000/api/teams', config)
                    ]);
                    setTasks(tasksRes.data);
                    setAllTeams(teamsRes.data);
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to fetch data');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [token]);

    const handleDelete = async (taskId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
                setTasks(tasks.filter(task => task._id !== taskId));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete task');
            }
        }
    };

    const handleUpdateStatus = async (taskId, newStatus, e) => {
        e.stopPropagation();
        try {
            const { data } = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setTasks(tasks.map(task => task._id === taskId ? data : task));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredTasks = filterByTeam
        ? tasks.filter(task => task.teams.some(team => team._id === filterByTeam))
        : tasks;

    if (loading) return <div>Loading tasks...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h3>My Tasks</h3>
            {/* --- Filter Dropdown --- */}
            <div style={{ marginBottom: '1rem' }}>
                <label>Filter by Team: </label>
                <select value={filterByTeam} onChange={(e) => setFilterByTeam(e.target.value)}>
                    <option value="">All Teams</option>
                    {allTeams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                    ))}
                </select>
            </div>

            {filteredTasks.length === 0 ? (
                <p>No tasks found for the selected filter.</p>
            ) : (
                <ul>
                    {filteredTasks.map((task) => (
                        <li key={task._id} onClick={() => onTaskClick(task)} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', cursor: 'pointer' }}>
                            <h4>{task.title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p>Status: {task.status}</p>
                                    <p>Teams: {task.teams.map(t => t.name).join(', ')}</p>
                                </div>
                                <div>
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleUpdateStatus(task._id, e.target.value, e)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ marginRight: '10px' }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <button onClick={(e) => handleDelete(task._id, e)}>Delete</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TaskList;