import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TeamList = ({ onTeamCreatedOrJoined }) => {
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [joinTeamId, setJoinTeamId] = useState(''); // Or team name/invite code
    const { token, user } = useContext(AuthContext);

    const fetchTeams = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/teams', config);
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTeams();
        }
    }, [token, onTeamCreatedOrJoined]); // Re-fetch when prop changes

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/teams', { name: newTeamName }, config);
            alert('Team created successfully!');
            setNewTeamName('');
            fetchTeams(); // Re-fetch all teams
            onTeamCreatedOrJoined(); // Notify parent (Dashboard) to update tasks
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create team');
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Note: For simplicity, we assume joining by ID. In real app, might be invite code.
            const { data } = await axios.post(`http://localhost:5000/api/teams/${joinTeamId}/join`, {}, config);
            alert('Joined team successfully!');
            setJoinTeamId('');
            fetchTeams();
            onTeamCreatedOrJoined();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to join team');
        }
    };

    const handleLeaveTeam = async (teamId) => {
        if (window.confirm('Are you sure you want to leave this team?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.post(`http://localhost:5000/api/teams/${teamId}/leave`, {}, config);
                alert('Left team successfully!');
                fetchTeams();
                onTeamCreatedOrJoined();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to leave team');
            }
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
            <h3>Your Teams</h3>
            <form onSubmit={handleCreateTeam}>
                <input
                    type="text"
                    placeholder="New Team Name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                />
                <button type="submit">Create Team</button>
            </form>
            <form onSubmit={handleJoinTeam} style={{ marginTop: '10px' }}>
                <input
                    type="text"
                    placeholder="Team ID to Join" // Or 'Invite Code'
                    value={joinTeamId}
                    onChange={(e) => setJoinTeamId(e.target.value)}
                    required
                />
                <button type="submit">Join Team</button>
            </form>

            {teams.length === 0 ? (
                <p>You are not part of any teams yet.</p>
            ) : (
                <ul>
                    {teams.map((team) => (
                        <li key={team._id} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
                            <h4>{team.name} {team.owner && team.owner._id === user._id && '(Owner)'}</h4>
                            <p>Members:</p>
                            <ul>
                                {team.members.map(member => (
                                    <li key={member._id} style={{ display: 'flex', alignItems: 'center' }}>
                                        {member.name}
                                        {member.isOnline ? (
                                            <span style={{ marginLeft: '5px', color: 'green', fontSize: '0.8em' }}>● Online</span>
                                        ) : (
                                            <span style={{ marginLeft: '5px', color: 'gray', fontSize: '0.8em' }}>○ Offline</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {team.owner && team.owner._id !== user._id && ( // Only show leave button if not owner
                                <button onClick={() => handleLeaveTeam(team._id)}>Leave Team</button>
                            )}
                            {/* You'd add delete team button here for owner */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TeamList;