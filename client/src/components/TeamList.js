"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  Paper,
  Collapse,
  Badge,
} from "@mui/material"
import {
  Group as GroupIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
} from "@mui/icons-material"

const TeamList = ({ onManageTeam, onTeamAction }) => {
  const [teams, setTeams] = useState([])
  const [expandedTeams, setExpandedTeams] = useState({})
  const [loading, setLoading] = useState(true)
  const { user, token } = useContext(AuthContext)

  useEffect(() => {
    const fetchTeams = async () => {
      if (!token) return
      setLoading(true)
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        const { data } = await axios.get("${process.env.REACT_APP_API_URL}/api/teams", config)
        setTeams(data)
        // Auto-expand first team
        if (data.length > 0) {
          setExpandedTeams({ [data[0]._id]: true })
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [token])

  const toggleTeamExpansion = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }))
  }

  const handleCreateTeam = () => {
    console.log("Create team functionality would go here")
  }

  const canManageTeams = user?.role === "admin" || user?.role === "team-leader"

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Loading teams...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Teams
        </Typography>
        {canManageTeams && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreateTeam}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontSize: "0.75rem",
              px: 2,
              py: 0.5,
            }}
          >
            New Team
          </Button>
        )}
      </Box>

      {teams.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: "background.surface",
          }}
        >
          <GroupIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No teams found
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Create your first team to get started
          </Typography>
        </Paper>
      ) : (
        <List sx={{ p: 0 }}>
          {teams.map((team, index) => {
            const isExpanded = expandedTeams[team._id]
            const isUserLeader = team.leader?._id === user?._id
            const onlineMembers = team.members?.filter((member) => member.isOnline) || []

            return (
              <Paper
                key={team._id}
                variant="outlined"
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {/* Team Header */}
                <ListItem
                  button
                  onClick={() => toggleTeamExpansion(team._id)}
                  sx={{
                    py: 2,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={onlineMembers.length}
                      color="success"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.7rem",
                          height: 18,
                          minWidth: 18,
                          right: 2,
                          top: 2,
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 40,
                          height: 40,
                        }}
                      >
                        <GroupIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {team.name}
                        </Typography>
                        {isUserLeader && (
                          <Chip
                            label="Lead"
                            size="small"
                            icon={<StarIcon sx={{ fontSize: "0.7rem" }} />}
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              bgcolor: "warning.main",
                              color: "white",
                              fontWeight: 500,
                              "& .MuiChip-icon": {
                                color: "white",
                              },
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {team.members?.length || 0} members
                        </Typography>
                        {team.leader && (
                          <>
                            <Typography variant="caption" color="text.disabled">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Led by {team.leader.name}
                            </Typography>
                          </>
                        )}
                      </Box>
                    }
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {canManageTeams && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          onManageTeam(team)
                        }}
                        size="small"
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            color: "white",
                            bgcolor: "primary.main",
                          },
                        }}
                      >
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                  </Box>
                </ListItem>

                {/* Team Members */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Divider />
                  <Box sx={{ p: 2, bgcolor: "background.surface" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500 }}>
                      Team Members ({team.members?.length || 0})
                    </Typography>
                    {team.members && team.members.length > 0 ? (
                      <List dense sx={{ p: 0 }}>
                        {team.members.map((member) => (
                          <ListItem key={member._id} sx={{ px: 0, py: 0.5 }}>
                            <ListItemAvatar sx={{ minWidth: 36 }}>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                badgeContent={
                                  <Box
                                    sx={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      bgcolor: member.isOnline ? "success.main" : "grey.400",
                                      border: "2px solid",
                                      borderColor: "background.paper",
                                    }}
                                  />
                                }
                              >
                                <Avatar
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: member.isOnline ? "success.main" : "grey.400",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {member.name}
                                  </Typography>
                                  {team.leader?._id === member._id && (
                                    <Chip
                                      label="Lead"
                                      size="small"
                                      icon={<StarIcon sx={{ fontSize: "0.6rem" }} />}
                                      sx={{
                                        height: 16,
                                        fontSize: "0.6rem",
                                        bgcolor: "warning.main",
                                        color: "white",
                                        fontWeight: 500,
                                        "& .MuiChip-icon": {
                                          color: "white",
                                        },
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  color={member.isOnline ? "success.main" : "text.secondary"}
                                  sx={{ fontWeight: member.isOnline ? 500 : 400 }}
                                >
                                  {member.isOnline ? "Online" : "Offline"}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                        No members in this team
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            )
          })}
        </List>
      )}
    </Box>
  )
}

export default TeamList