import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TeamManagementModal from './TeamManagementModal';

const TeamManagement = ({ key: refreshKey }) => {
    const [teams, setTeams] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const { token } = useContext(AuthContext);

    const fetchData = async () => {
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [teamsRes, usersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/teams', config),
                axios.get('http://localhost:5000/api/admin/users', config)
            ]);
            setTeams(teamsRes.data);
            setAllUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, refreshKey]);

    const handleOpenModal = (team) => {
        setSelectedTeam(team);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTeam(null);
        fetchData(); 
    };

    const handleDelete = async (teamId) => {
        if (window.confirm('Are you sure you want to permanently delete this team?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/teams/${teamId}`, config);
                alert('Team deleted successfully.');
                fetchData();
            } catch (error) {
                console.error("Failed to delete team:", error);
                alert('Failed to delete team.');
            }
        }
    };

    const columns = [
        { field: 'name', headerName: 'Team Name', flex: 1, minWidth: 150 },
        {
            field: 'leader',
            headerName: 'Leader',
            flex: 1,
            minWidth: 150,
            valueGetter: (params) => params?.row?.leader?.name || 'Not Assigned',
        },
        {
            field: 'members',
            headerName: 'Members',
            flex: 2,
            minWidth: 250,
            valueGetter: (params) =>
                params?.row?.members?.map((m) => m.name).join(', ') || '',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleOpenModal(params.row)} aria-label="manage team">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row._id)} aria-label="delete team">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>Team Management</Typography>
            <Box sx={{ height: 371, width: '100%' }}>
                <DataGrid
                    rows={teams}
                    columns={columns}
                    getRowId={(row) => row._id}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 5 } },
                    }}
                    pageSizeOptions={[5]}
                    disableRowSelectionOnClick
                />
            </Box>

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