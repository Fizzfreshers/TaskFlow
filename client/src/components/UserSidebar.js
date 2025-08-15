"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import { SocketContext } from "../context/SocketContext"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Badge,
  Collapse,
  IconButton,
} from "@mui/material"
import {
  Group as GroupIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material"

const UserSidebar = () => {
  const [teamsWithUsers, setTeamsWithUsers] = useState([])
  const [expandedTeams, setExpandedTeams] = useState({})
  const { token } = useContext(AuthContext)
  const socket = useContext(SocketContext)

  const fetchTeamsWithUsers = async () => {
    if (!token) return
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/teams`, config)
      setTeamsWithUsers(data)
      // Auto-expand first team
      if (data.length > 0) {
        setExpandedTeams({ [data[0]._id]: true })
      }
    } catch (error) {
      console.error("Error fetching teams with users:", error)
    }
  }

  useEffect(() => {
    fetchTeamsWithUsers()
  }, [token])

  useEffect(() => {
    if (socket) {
      const handleUserStatusChange = ({ userId, isOnline }) => {
        setTeamsWithUsers((currentTeams) => {
          return currentTeams.map((team) => {
            const newMembers = team.members.map((member) => {
              if (member._id === userId) {
                return { ...member, isOnline }
              }
              return member
            })
            return { ...team, members: newMembers }
          })
        })
      }

      socket.on("userStatusChange", handleUserStatusChange)
      return () => {
        socket.off("userStatusChange", handleUserStatusChange)
      }
    }
  }, [socket])

  const toggleTeamExpansion = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }))
  }

  const getOnlineCount = (members) => {
    return members.filter((member) => member.isOnline).length
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
          Team Members
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {teamsWithUsers.reduce((total, team) => total + team.members.length, 0)} members across{" "}
          {teamsWithUsers.length} teams
        </Typography>
      </Box>

      <Divider />

      {/* Teams List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
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
        {teamsWithUsers.map((team, index) => {
          const onlineCount = getOnlineCount(team.members)
          const isExpanded = expandedTeams[team._id]

          return (
            <Box key={team._id}>
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
                    badgeContent={onlineCount}
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
                    <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                      <GroupIcon />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {team.name}
                    </Typography>
                  }
                  secondary={`${team.members.length} members`}
                />
                <IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
              </ListItem>

              {/* Team Members */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List sx={{ pl: 2, pr: 1 }}>
                  {team.members.map((member) => (
                    <ListItem key={member._id} sx={{ py: 1 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          badgeContent={
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
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
                              width: 32,
                              height: 32,
                              bgcolor: member.isOnline ? "success.main" : "grey.400",
                              fontSize: "0.875rem",
                            }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {member.name}
                            </Typography>
                            {team.leader?._id === member._id && (
                              <Chip
                                label="Lead"
                                size="small"
                                icon={<StarIcon sx={{ fontSize: "0.65rem" }} />}
                                sx={{
                                  height: 18,
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
              </Collapse>

              {index < teamsWithUsers.length - 1 && <Divider />}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default UserSidebar