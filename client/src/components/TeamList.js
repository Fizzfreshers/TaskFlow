import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const TeamList = ({ onTeamAction }) => {
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const { token, user } = useContext(AuthContext);
    const socket = useContext(SocketContext);

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
    }, [token]);

    useEffect(() => {
        if (socket) {
            socket.on('userStatusChange', ({ userId, isOnline }) => {
                setTeams(prevTeams => 
                    prevTeams.map(team => ({
                        ...team,
                        members: team.members.map(member => 
                            member._id === userId ? { ...member, isOnline } : member
                        )
                    }))
                );
            });

            return () => {
                socket.off('userStatusChange');
            };
        }
    }, [socket]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/teams', { name: newTeamName }, config);
            setNewTeamName('');
            fetchTeams();
            onTeamAction();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create team');
        }
    };
    
    const handleDeleteTeam = async (teamId) => {
    }
    
    const renderAdminControls = () => {
        if (user && user.role === 'admin') {
            return (
                <form onSubmit={handleCreateTeam}>
                    <input type="text" placeholder="New Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required/>
                    <button type="submit">Create Team</button>
                </form>
            );
        }
        return null;
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
            <h3>Your Teams</h3>
            {renderAdminControls()}
            
            {/* The rest of the TeamList rendering logic will go here. */}
            {/* You'll need to add buttons for "Add Member", "Set Leader" etc. */}
            {/* and conditionally render them based on user.role */}
            {teams.length === 0 ? (
                <p>You are not part of any teams yet.</p>
            ) : (
                <ul>
                    {teams.map((team) => (
                        <li key={team._id} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
                            <h4>{team.name}</h4>
                            <p>Leader: {team.leader ? team.leader.name : 'None'}</p>
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
                                        {team.leader && team.leader._id === member._id && (
                                            <span style={{ marginLeft: '8px', background: '#ffc107', color: '#212529', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75em', fontWeight: 'bold' }}>
                                                Team Leader
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TeamList;