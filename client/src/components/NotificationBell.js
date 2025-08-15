"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import { SocketContext } from "../context/SocketContext"
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box,
  Avatar,
} from "@mui/material"
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  NotificationsActive as NewNotificationIcon,
} from "@mui/icons-material"

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const { token } = useContext(AuthContext)
  const socket = useContext(SocketContext)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return
      const config = { headers: { Authorization: `Bearer ${token}` } }
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`, config)
        setNotifications(data)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }
    fetchNotifications()
  }, [token])

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev])
      }
      socket.on("newNotification", handleNewNotification)
      return () => socket.off("newNotification", handleNewNotification)
    }
  }, [socket])

  const handleOpen = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const markAsRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.put(`${process.env.REACT_APP_API_URL}/api/notifications/mark-read`, {}, config)
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/notifications/${id}`, config)
      setNotifications(notifications.filter((n) => n._id !== id))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{
          position: "relative",
          color: "text.secondary",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.7rem",
              height: 16,
              minWidth: 16,
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={markAsRead}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 320,
            maxHeight: 400,
            overflow: "auto",
            borderRadius: 2,
            mt: 1.5,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "No new notifications"}
          </Typography>
        </Box>

        {notifications.length > 0 ? (
          notifications.map((n) => (
            <MenuItem
              key={n._id}
              sx={{
                py: 1.5,
                px: 2,
                borderLeft: n.read ? "none" : "3px solid",
                borderColor: "primary.main",
                bgcolor: n.read ? "transparent" : "action.hover",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
                <Avatar
                  sx={{
                    bgcolor: n.read ? "grey.200" : "primary.main",
                    width: 36,
                    height: 36,
                  }}
                >
                  {n.read ? <NotificationsIcon /> : <NewNotificationIcon />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <ListItemText
                    primary={n.message}
                    secondary={new Date(n.createdAt).toLocaleString()}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: n.read ? 400 : 500,
                      color: "text.primary",
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      color: "text.secondary",
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => deleteNotification(n._id)}
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          color: "error.main",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </Box>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}

        {notifications.length > 0 && (
          <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{
                cursor: "pointer",
                fontWeight: 500,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Clear all notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  )
}

export default NotificationBell