"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import { Link } from "react-router-dom"
import {
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
  IconButton,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from "@mui/icons-material"
import UserManagement from "../components/admin/UserManagement"
import TeamManagement from "../components/admin/TeamManagement"

const AdminDashboard = () => {
  const { token } = useContext(AuthContext)
  const [newTeamName, setNewTeamName] = useState("")
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchUsers = async () => {
    if (!token) return
    const config = { headers: { Authorization: `Bearer ${token}` } }
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/users", config)
      setAllUsers(data.filter((u) => u.role === "user"))
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token, refreshKey])

  const handleCreateTeam = async () => {
    if (!newTeamName || selectedUsers.length === 0) {
      alert("Please provide a team name and select at least one member.")
      return
    }

    const config = { headers: { Authorization: `Bearer ${token}` } }
    try {
      await axios.post(
        "http://localhost:5000/api/teams",
        {
          name: newTeamName,
          members: selectedUsers,
        },
        config,
      )
      alert("Team created successfully!")
      setNewTeamName("")
      setSelectedUsers([])
      setRefreshKey((prevKey) => prevKey + 1)
    } catch (error) {
      console.error("Error creating team:", error)
      alert("Failed to create team. " + (error.response?.data?.message || ""))
    }
  }

  const handleUserSelection = (event) => {
    const {
      target: { value },
    } = event
    setSelectedUsers(typeof value === "string" ? value.split(",") : value)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          component={Link}
          to="/dashboard"
          sx={{
            mr: 2,
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>
          Admin Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <GroupIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Create New Team
              </Typography>
            </Box>

            <TextField
              label="Team Name"
              variant="outlined"
              fullWidth
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="select-members-label">Initial Members</InputLabel>
              <Select
                labelId="select-members-label"
                multiple
                value={selectedUsers}
                onChange={handleUserSelection}
                input={<OutlinedInput id="select-multiple-chip" label="Initial Members" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((userId) => {
                      const user = allUsers.find((u) => u._id === userId)
                      return (
                        <Chip
                          key={userId}
                          label={user ? user.name : "..."}
                          size="small"
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                          }}
                        />
                      )
                    })}
                  </Box>
                )}
                sx={{ borderRadius: 2 }}
              >
                {allUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon color="primary" />
                      {user.name} ({user.email})
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleCreateTeam}
              startIcon={<AddIcon />}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                boxShadow: "0 2px 8px rgba(26, 115, 232, 0.25)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(26, 115, 232, 0.35)",
                },
              }}
            >
              Create Team
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <TeamManagement key={refreshKey} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <UserManagement key={refreshKey} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AdminDashboard