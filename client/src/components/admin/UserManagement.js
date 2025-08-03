"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import { Box, Typography, Chip, Paper, Avatar } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import {
  CheckCircle as OnlineIcon,
  Cancel as OfflineIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  SupervisorAccount as LeaderIcon,
} from "@mui/icons-material"

const UserManagement = ({ key: refreshKey }) => {
  const [users, setUsers] = useState([])
  const { token } = useContext(AuthContext)
  const socket = useContext(SocketContext)

  const fetchUsers = async () => {
    if (!token) return
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const { data } = await axios.get("${process.env.REACT_APP_API_URL}/api/admin/users", config)
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token, refreshKey])

  useEffect(() => {
    if (socket) {
      const handleUserStatusChange = ({ userId, isOnline }) => {
        setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, isOnline } : user)))
      }
      socket.on("userStatusChange", handleUserStatusChange)

      return () => socket.off("userStatusChange", handleUserStatusChange)
    }
  }, [socket])

  const handleRoleChange = async (userId, newRole) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/role`, { role: newRole }, config)
      fetchUsers()
    } catch (error) {
      alert("Failed to update role.")
      console.error(error)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <AdminIcon sx={{ color: "error.main" }} />
      case "team-leader":
        return <LeaderIcon sx={{ color: "warning.main" }} />
      default:
        return <UserIcon sx={{ color: "info.main" }} />
    }
  }

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            height: "100%",
            py: 1,
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: params.row.isOnline ? "success.main" : "grey.400",
              fontSize: "0.875rem",
            }}
          >
            {params.value.charAt(0).toUpperCase()}
          </Avatar>
          <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography sx={{ fontSize: "0.875rem" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "isOnline",
      headerName: "Status",
      width: 120,
      align: "center",
      headerAlign: "center",
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
            icon={
              params.value ? <OnlineIcon sx={{ fontSize: "0.75rem" }} /> : <OfflineIcon sx={{ fontSize: "0.75rem" }} />
            }
            label={params.value ? "Online" : "Offline"}
            color={params.value ? "success" : "default"}
            size="small"
            sx={{
              fontWeight: 500,
              fontSize: "0.75rem",
              height: 24,
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      width: 150,
      align: "center",
      headerAlign: "center",
      editable: true,
      type: "singleSelect",
      valueOptions: ["user", "team-leader", "admin"],
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            height: "100%",
          }}
        >
          {getRoleIcon(params.value)}
          <Typography
            sx={{
              textTransform: "capitalize",
              fontWeight: 500,
              fontSize: "0.875rem",
              color:
                params.value === "admin" ? "error.main" : params.value === "team-leader" ? "warning.main" : "info.main",
            }}
          >
            {params.value.replace("-", " ")}
          </Typography>
        </Box>
      ),
    },
    {
      field: "teams",
      headerName: "Teams",
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) =>
        row.teams && row.teams.length > 0 ? row.teams.map((team) => team.name).join(", ") : "No Teams",
      renderCell: (params) => {
        const teamCount = params.row.teams?.length || 0
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {teamCount > 0 ? (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                {params.row.teams.slice(0, 2).map((team) => (
                  <Chip
                    key={team._id}
                    label={team.name}
                    size="small"
                    sx={{
                      bgcolor: "background.surface",
                      fontSize: "0.7rem",
                      height: 20,
                    }}
                  />
                ))}
                {teamCount > 2 && (
                  <Chip
                    label={`+${teamCount - 2} more`}
                    size="small"
                    sx={{
                      bgcolor: "background.surface",
                      fontSize: "0.7rem",
                      height: 20,
                    }}
                  />
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                No teams
              </Typography>
            )}
          </Box>
        )
      },
    },
  ]

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
        User Management
      </Typography>
      <Paper
        sx={{
          height: 400,
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
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          processRowUpdate={(newRow) => {
            handleRoleChange(newRow._id, newRow.role)
            return newRow
          }}
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
    </Box>
  )
}

export default UserManagement