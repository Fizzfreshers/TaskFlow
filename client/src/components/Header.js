"use client"

import { useContext } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import NotificationBell from "./NotificationBell"
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Chip } from "@mui/material"
import {
  Task as TaskIcon,
  AdminPanelSettings as AdminIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Person as PersonIcon,
} from "@mui/icons-material"

const Header = () => {
  const { user, logout } = useContext(AuthContext)
  const { isDarkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/auth")
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return { bgcolor: "error.main", color: "white" }
      case "team-leader":
        return { bgcolor: "warning.main", color: "white" }
      default:
        return { bgcolor: "info.main", color: "white" }
    }
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
          <TaskIcon sx={{ mr: 1.5, color: "primary.main" }} />
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 500,
              color: "text.primary",
            }}
          >
            TaskFlow
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user ? (
            <>
              <IconButton
                onClick={toggleDarkMode}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              {user.role === "admin" && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  startIcon={<AdminIcon />}
                  variant="outlined"
                  size="small"
                  sx={{
                    color: "text.primary",
                    borderColor: "divider",
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    fontWeight: 500,
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  Admin Panel
                </Button>
              )}

              <NotificationBell />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
                <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                        {user.name}
                      </Typography>
                      <Chip
                        label={user.role.replace("-", " ")}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          ...getRoleColor(user.role),
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    borderColor: "divider",
                    color: "text.primary",
                    fontWeight: 500,
                    px: 2,
                    py: 0.5,
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                      bgcolor: "error.main",
                      color: "white",
                    },
                  }}
                >
                  Logout
                </Button>
              </Box>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/auth"
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Login / Register
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header