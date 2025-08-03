"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Divider,
  Avatar,
  FormHelperText,
} from "@mui/material"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { Save as SaveIcon } from "@mui/icons-material"

const TaskForm = ({ task, onTaskCreated, onTaskUpdated }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState(null)
  const [assignedTo, setAssignedTo] = useState([])
  const [assignedTeams, setAssignedTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { user, token } = useContext(AuthContext)
  const [allTeams, setAllTeams] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [manageableUsers, setManageableUsers] = useState([])

  useEffect(() => {
    // Fetch all teams and users for the dropdowns
    const fetchData = async () => {
      if (!token) return
      const config = { headers: { Authorization: `Bearer ${token}` } }
      try {
        const [teamsRes, usersRes] = await Promise.all([
          axios.get("${process.env.REACT_APP_API_URL}/api/teams", config),
          axios.get("${process.env.REACT_APP_API_URL}/api/users", config),
        ])
        setAllTeams(teamsRes.data)
        setAllUsers(usersRes.data)

        // Determine which users are manageable based on role
        if (user.role === "admin") {
          setManageableUsers(usersRes.data)
        } else if (user.role === "team-leader") {
          const leaderTeams = teamsRes.data.filter((t) => t.leader?._id === user._id)
          const memberIds = new Set(leaderTeams.flatMap((t) => t.members.map((m) => m._id)))
          setManageableUsers(usersRes.data.filter((u) => memberIds.has(u._id)))
        }
      } catch (error) {
        console.error("Failed to fetch data for task form", error)
        setError("Failed to load teams and users. Please try again.")
      }
    }
    fetchData()

    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setDeadline(new Date(task.deadline))
      setAssignedTo(task.assignedTo.map((u) => u._id))
      setAssignedTeams(task.teams.map((t) => t._id))
    }
  }, [task, token, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const taskData = { title, description, deadline, assignedTo, teams: assignedTeams }
    const config = { headers: { Authorization: `Bearer ${token}` } }

    try {
      if (task) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task._id}`, taskData, config)
        if (onTaskUpdated) onTaskUpdated()
      } else {
        await axios.post("${process.env.REACT_APP_API_URL}/api/tasks", taskData, config)
        if (onTaskCreated) onTaskCreated()
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred while saving the task.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const canAssignToIndividuals = user.role === "admin" || user.role === "team-leader"

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
          {task ? "Edit Task" : "Create New Task"}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
          sx={{ mb: 2 }}
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          sx={{ mb: 2 }}
        />

        <DateTimePicker label="Deadline" value={deadline} onChange={setDeadline} sx={{ width: "100%", mb: 3 }} />

        <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
          <InputLabel id="teams-select-label">Assign to Team(s)</InputLabel>
          <Select
            labelId="teams-select-label"
            multiple
            value={assignedTeams}
            onChange={(e) => setAssignedTeams(e.target.value)}
            input={<OutlinedInput label="Assign to Team(s)" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((id) => {
                  const team = allTeams.find((t) => t._id === id)
                  return (
                    <Chip
                      key={id}
                      label={team?.name || "..."}
                      size="small"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        fontWeight: 500,
                      }}
                    />
                  )
                })}
              </Box>
            )}
            sx={{ borderRadius: 2 }}
          >
            {allTeams.map((team) => (
              <MenuItem key={team._id} value={team._id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" disabled={!canAssignToIndividuals} sx={{ mb: 3 }}>
          <InputLabel id="users-select-label">Assign to Individual(s)</InputLabel>
          <Select
            labelId="users-select-label"
            multiple
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            input={<OutlinedInput label="Assign to Individual(s)" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((id) => {
                  const assignedUser = allUsers.find((u) => u._id === id)
                  return (
                    <Chip
                      key={id}
                      label={assignedUser?.name || "..."}
                      size="small"
                      avatar={
                        <Avatar sx={{ bgcolor: "primary.dark" }}>{assignedUser?.name.charAt(0).toUpperCase()}</Avatar>
                      }
                      sx={{
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "primary.main",
                        color: "text.primary",
                      }}
                    />
                  )
                })}
              </Box>
            )}
            sx={{ borderRadius: 2 }}
          >
            {manageableUsers.map((u) => (
              <MenuItem key={u._id} value={u._id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
          {!canAssignToIndividuals && (
            <FormHelperText>Only Admins and Team Leaders can assign to individuals.</FormHelperText>
          )}
        </FormControl>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(26, 115, 232, 0.25)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(26, 115, 232, 0.35)",
              },
            }}
          >
            {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}

export default TaskForm