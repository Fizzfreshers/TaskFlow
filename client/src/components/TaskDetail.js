import React from 'react';

const TaskDetail = ({ task }) => {
    if (!task) return null;

    return (
        <div>
            <h2>{task.title}</h2>
            <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{task.status}</span></p>
            <p><strong>Deadline:</strong> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</p>
            <hr />
            <p><strong>Description:</strong></p>
            <p>{task.description || 'No description provided.'}</p>
            <hr />
            <p><strong>Assigned To:</strong></p>
            <ul>
                {task.assignedTo.map(user => <li key={user._id}>{user.name} ({user.email})</li>)}
            </ul>
            <p><strong>Assigned Teams:</strong></p>
            <ul>
                {task.teams.map(team => <li key={team._id}>{team.name}</li>)}
            </ul>
        </div>
    );
};

export default TaskDetail;