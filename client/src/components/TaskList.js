"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  IconButton,
  Avatar,
  AvatarGroup,
  Divider,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
} from "@mui/icons-material"

const statusConfig = {
  pending: { color: "#f59e0b", bg: "#fef3c7", label: "Pending" },
  "in-progress": { color: "#3b82f6", bg: "#dbeafe", label: "In Progress" },
  completed: { color: "#10b981", bg: "#d1fae5", label: "Completed" },
}

const TaskList = ({ onTaskClick }) => {
  const [tasks, setTasks] = useState([])
  const [allTeams, setAllTeams] = useState([])
  const [filterByTeam, setFilterByTeam] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useContext(AuthContext)

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        const [tasksRes, teamsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/tasks", config),
          axios.get("http://localhost:5000/api/teams", config),
        ])
        setTasks(tasksRes.data)
        setAllTeams(teamsRes.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  const handleDelete = async (taskId, e) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setTasks(tasks.filter((task) => task._id !== taskId))
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete task")
      }
    }
  }

  const handleUpdateStatus = async (taskId, newStatus, e) => {
    e.stopPropagation()
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setTasks(tasks.map((task) => (task._id === taskId ? { ...task, ...data } : task)))
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status")
    }
  }

  const filteredTasks = filterByTeam
    ? tasks.filter((task) => task.teams.some((team) => team._id === filterByTeam))
    : tasks

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading tasks...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>
          Tasks
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Filter by Team</InputLabel>
          <Select
            value={filterByTeam}
            label="Filter by Team"
            onChange={(e) => setFilterByTeam(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">
              <em>All Teams</em>
            </MenuItem>
            {allTeams.map((team) => (
              <MenuItem key={team._id} value={team._id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider />

      {/* Task List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
        }}
      >
        {filteredTasks.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "text.secondary",
            }}
          >
            <Typography variant="body1">No tasks found</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Create your first task to get started
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredTasks.map((task) => {
              const statusInfo = statusConfig[task.status]
              const daysUntilDeadline = task.deadline
                ? Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                : null

              return (
                <Card
                  key={task._id}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                  onClick={() => onTaskClick(task)}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, flex: 1 }}>
                        {task.title}
                      </Typography>
                      <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Status and Deadline */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Chip
                        label={statusInfo.label}
                        size="small"
                        sx={{
                          bgcolor: statusInfo.bg,
                          color: statusInfo.color,
                          fontWeight: 500,
                          border: `1px solid ${statusInfo.color}20`,
                        }}
                      />
                      {task.deadline && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {daysUntilDeadline > 0
                              ? `${daysUntilDeadline} days left`
                              : daysUntilDeadline === 0
                                ? "Due today"
                                : `${Math.abs(daysUntilDeadline)} days overdue`}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Teams */}
                    {task.teams.length > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <GroupIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {task.teams.map((team) => (
                            <Chip
                              key={team._id}
                              label={team.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Assigned Users */}
                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <AvatarGroup
                          max={3}
                          sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: "0.75rem" } }}
                        >
                          {task.assignedTo.map((user) => (
                            <Avatar key={user._id} sx={{ bgcolor: "primary.main" }}>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task._id, e.target.value, e)}
                        onClick={(e) => e.stopPropagation()}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          "& .MuiSelect-select": {
                            py: 0.5,
                          },
                        }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1 }} />

                    <IconButton
                      onClick={(e) => handleDelete(task._id, e)}
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
                  </CardActions>
                </Card>
              )
            })}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default TaskList