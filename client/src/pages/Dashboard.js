"use client"

import { useContext, useState, useEffect } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import TeamManagementModal from "../components/admin/TeamManagementModal"
import TaskList from "../components/TaskList"
import TeamList from "../components/TeamList"
import TaskCalendar from "../components/TaskCalendar"
import TaskForm from "../components/TaskForm"
import TaskDetail from "../components/TaskDetail"
import UserSidebar from "../components/UserSidebar"
import { Box, Paper, Typography, Button, Modal, Fade, Backdrop } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 600, md: 700 },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
  border: "none",
}

const Dashboard = () => {
  const { user, token } = useContext(AuthContext)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [taskToView, setTaskToView] = useState(null)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [allUsers, setAllUsers] = useState([])

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!token) return
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, config)
        setAllUsers(data)
      } catch (error) {
        console.error("Failed to fetch all users:", error)
      }
    }

    if (user && (user.role === "admin" || user.role === "team-leader")) {
      fetchAllUsers()
    }
  }, [token, user])

  const handleAction = () => setRefreshTrigger((prev) => prev + 1)
  const handleTaskClick = (task) => setTaskToView(task)
  const handleViewModalClose = () => setTaskToView(null)
  const handleFormModalClose = () => {
    setIsTaskFormOpen(false)
    handleAction()
  }

  const handleOpenTeamModal = (team) => {
    setSelectedTeam(team)
    setIsTeamModalOpen(true)
  }

  const handleCloseTeamModal = () => {
    setSelectedTeam(null)
    setIsTeamModalOpen(false)
    handleAction()
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 400,
                color: "text.primary",
                mb: 0.5,
              }}
            >
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your projects today
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsTaskFormOpen(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: "none",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(26, 115, 232, 0.25)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(26, 115, 232, 0.35)",
              },
            }}
          >
            New Task
          </Button>
        </Box>
      </Box>

      {/* 3-Column Layout with 1:2:1 ratio */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          gap: 2,
          p: 2,
          overflow: "hidden",
        }}
      >
        {/* Left Column - Task List (1 part) */}
        <Box sx={{ flex: 1, display: "flex" }}>
          <Paper
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <TaskList key={`list-${refreshTrigger}`} onTaskClick={handleTaskClick} />
          </Paper>
        </Box>

        {/* Middle Column - Team List & Calendar (2 parts) */}
        <Box
          sx={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Team List - Top half of middle column */}
          <Paper
            sx={{
              flex: "0 0 40%", // 40% of middle column height
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ p: 2, height: "100%", overflow: "hidden" }}>
              <TeamList
                key={`teams-${refreshTrigger}`}
                onManageTeam={handleOpenTeamModal}
                onTeamAction={handleAction}
              />
            </Box>
          </Paper>

          {/* Calendar - Bottom half of middle column */}
          <Paper
            sx={{
              flex: 1, // Take remaining space
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
              <TaskCalendar key={`calendar-${refreshTrigger}`} onTaskClick={handleTaskClick} />
            </Box>
          </Paper>
        </Box>

        {/* Right Column - User List (1 part) */}
        <Box sx={{ flex: 1, display: "flex" }}>
          <Paper
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <UserSidebar />
          </Paper>
        </Box>
      </Box>

      {/* Modals */}
      <Modal
        open={!!taskToView}
        onClose={handleViewModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={!!taskToView}>
          <Box sx={modalStyle}>
            <TaskDetail task={taskToView} />
          </Box>
        </Fade>
      </Modal>

      <Modal
        open={isTaskFormOpen}
        onClose={handleFormModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isTaskFormOpen}>
          <Box sx={modalStyle}>
            <TaskForm onTaskCreated={handleFormModalClose} onTaskUpdated={handleFormModalClose} />
          </Box>
        </Fade>
      </Modal>

      {isTeamModalOpen && selectedTeam && (
        <TeamManagementModal
          open={isTeamModalOpen}
          onClose={handleCloseTeamModal}
          team={selectedTeam}
          allUsers={allUsers}
        />
      )}
    </Box>
  )
}

export default Dashboard