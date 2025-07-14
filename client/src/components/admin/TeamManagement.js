import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, Button, IconButton, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TeamManagementModal from './TeamManagementModal';

const TeamManagement = () => {
    const [teams, setTeams] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [newTeamName, setNewTeamName] = useState('');
    const { token } = useContext(AuthContext);

    const fetchData = async () => {
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [teamsRes, usersRes] = await Promise.all([
                axios.get('/api/admin/teams', config),
                axios.get('/api/admin/users', config)
            ]);
            setTeams(teamsRes.data);
            setAllUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);
    
    const handleOpenModal = (team) => {
        setSelectedTeam(team);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTeam(null);
        fetchData(); 
    };
    
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/teams', { name: newTeamName }, { headers: { Authorization: `Bearer ${token}` } });
            setNewTeamName('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create team');
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm('Delete this team permanently? This cannot be undone.')) {
            try {
                await axios.delete(`/api/teams/${teamId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete team');
            }
        }
    };

    const columns = [
        { field: 'name', headerName: 'Team Name', width: 250 },
        { field: 'leaderName', headerName: 'Leader', width: 200, valueGetter: (params) => params.row.leader?.name || 'N/A' },
        { field: 'memberCount', headerName: 'Members', type: 'number', width: 120, valueGetter: (params) => params.row.members.length },
        {
            field: 'actions', headerName: 'Actions', width: 150, sortable: false, filterable: false,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleOpenModal(params.row)} aria-label="manage team">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTeam(params.id)} aria-label="delete team">
                        <DeleteIcon color="error" />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Typography variant="h6" gutterBottom>Team Management</Typography>
            <Box component="form" onSubmit={handleCreateTeam} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField size="small" label="New Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required sx={{ flexGrow: 1 }} />
                <Button type="submit" variant="contained">Create</Button>
            </Box>
            <DataGrid
                rows={teams.map(t => ({ ...t, id: t._id }))}
                columns={columns}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                pageSizeOptions={[5]}
            />
            {isModalOpen && selectedTeam && (
                <TeamManagementModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    team={selectedTeam}
                    allUsers={allUsers}
                />
            )}
        </Box>
    );
};

export default TeamManagement;