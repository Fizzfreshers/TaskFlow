"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../../context/AuthContext"
import { Box, Typography, IconButton, Paper, Chip, Button } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from "@mui/icons-material"
import TeamManagementModal from "./TeamManagementModal"

const TeamManagement = ({ key: refreshKey }) => {
  const [teams, setTeams] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const { token } = useContext(AuthContext)

  const fetchData = async () => {
    if (!token) return
    const config = { headers: { Authorization: `Bearer ${token}` } }
    try {
      const [teamsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/teams", config),
        axios.get("http://localhost:5000/api/admin/users", config),
      ])
      setTeams(teamsRes.data)
      setAllUsers(usersRes.data)
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token, refreshKey])

  const handleOpenModal = (team) => {
    setSelectedTeam(team)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTeam(null)
    fetchData()
  }

  const handleDelete = async (teamId) => {
    if (window.confirm("Are you sure you want to permanently delete this team?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        await axios.delete(`http://localhost:5000/api/teams/${teamId}`, config)
        alert("Team deleted successfully.")
        fetchData()
      } catch (error) {
        console.error("Failed to delete team:", error)
        alert("Failed to delete team.")
      }
    }
  }

  const columns = [
    {
      field: "name",
      headerName: "Team Name",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: "100%",
            py: 1,
          }}
        >
          <GroupIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "leader",
      headerName: "Leader",
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) => row.leader?.name || "Not Assigned",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: "100%",
            py: 1,
          }}
        >
          <PersonIcon
            sx={{
              color: params.value === "Not Assigned" ? "text.disabled" : "success.main",
              fontSize: 20,
            }}
          />
          <Typography
            sx={{
              fontSize: "0.875rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "140px",
            }}
            title={params.value}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "members",
      headerName: "Members",
      width: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row.members?.length || 0,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: "background.surface",
              fontWeight: 500,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.5,
            height: "100%",
          }}
        >
          <IconButton
            onClick={() => handleOpenModal(params.row)}
            aria-label="manage team"
            size="small"
            sx={{
              color: "primary.main",
              "&:hover": {
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row._id)}
            aria-label="delete team"
            size="small"
            sx={{
              color: "error.main",
              "&:hover": {
                bgcolor: "error.main",
                color: "white",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Team Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          New Team
        </Button>
      </Box>

      <Paper
        sx={{
          height: 371,
          width: "100%",
          "& .MuiDataGrid-root": {
            border: "none",
            borderRadius: 2,
            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus-within": {
              outline: "none",
            },
          },
        }}
      >
        <DataGrid
          rows={teams}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          rowHeight={56}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "background.surface",
              borderRadius: "8px 8px 0 0",
              fontSize: "0.875rem",
              fontWeight: 600,
            },
            "& .MuiDataGrid-columnHeader": {
              padding: "0 16px",
            },
            "& .MuiDataGrid-cell": {
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-row": {
              "&:hover": {
                bgcolor: "action.hover",
              },
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid",
              borderColor: "divider",
            },
          }}
        />
      </Paper>

      {isModalOpen && selectedTeam && (
        <TeamManagementModal open={isModalOpen} onClose={handleCloseModal} team={selectedTeam} allUsers={allUsers} />
      )}
    </Box>
  )
}

export default TeamManagement