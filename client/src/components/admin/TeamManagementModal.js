"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../../context/AuthContext"
import {
  Modal,
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  ListItemAvatar,
  Fade,
  Backdrop,
  Paper,
} from "@mui/material"
import { Delete as DeleteIcon, PersonAdd as PersonAddIcon } from "@mui/icons-material"

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  p: 0,
  border: "none",
  maxHeight: "90vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}

const TeamManagementModal = ({ open, onClose, team, allUsers }) => {
  const [currentTeam, setCurrentTeam] = useState(team)
  const [userToAdd, setUserToAdd] = useState("")
  const [leaderToSet, setLeaderToSet] = useState("")
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (open) {
      setCurrentTeam(team)
      setLeaderToSet(team.leader?._id || "")
    }
  }, [team, open])

  const handleAddMember = async () => {
    if (!userToAdd) return
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/teams/${currentTeam._id}/members`,
        { userId: userToAdd },
        config,
      )

      setCurrentTeam(data)
      setUserToAdd("")
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add member")
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/teams/${currentTeam._id}/members/${memberId}`, config)

        const updatedMembers = currentTeam.members.filter((m) => m._id !== memberId)
        const newLeaderId =
          currentTeam.leader?._id === memberId ? updatedMembers[0]?._id || "" : currentTeam.leader?._id

        setCurrentTeam({ ...currentTeam, members: updatedMembers, leader: { _id: newLeaderId } })
        setLeaderToSet(newLeaderId)
      } catch (error) {
        alert(error.response?.data?.message || "Failed to remove member")
      }
    }
  }

  const handleSetLeader = async (e) => {
    const newLeaderId = e.target.value
    setLeaderToSet(newLeaderId)
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.put(`${process.env.REACT_APP_API_URL}/api/teams/${currentTeam._id}/leader`, { userId: newLeaderId }, config)
    } catch (error) {
      alert(error.response?.data?.message || "Failed to set leader")
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Manage Team
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentTeam.name}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3, overflow: "auto", flex: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Team Leader
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel id="leader-select-label">Select Team Leader</InputLabel>
              <Select
                labelId="leader-select-label"
                value={leaderToSet}
                label="Select Team Leader"
                onChange={handleSetLeader}
                sx={{ borderRadius: 2 }}
              >
                {currentTeam.members.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Team Members
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                mb: 3,
                maxHeight: 200,
                overflow: "auto",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <List dense>
                {currentTeam.members.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No members in this team" />
                  </ListItem>
                ) : (
                  currentTeam.members.map((member) => (
                    <ListItem
                      key={member._id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete member"
                          onClick={() => handleRemoveMember(member._id)}
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
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={member._id === leaderToSet ? "Team Leader" : null}
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondaryTypographyProps={{ color: "primary" }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Add New Member
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="add-user-label">Select User</InputLabel>
                <Select
                  labelId="add-user-label"
                  value={userToAdd}
                  label="Select User"
                  onChange={(e) => setUserToAdd(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {allUsers
                    .filter((u) => !currentTeam.members.some((m) => m._id === u._id))
                    .map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Button
                onClick={handleAddMember}
                variant="contained"
                startIcon={<PersonAddIcon />}
                disabled={!userToAdd}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  whiteSpace: "nowrap",
                  textTransform: "none",
                }}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ p: 3, borderTop: "1px solid", borderColor: "divider", textAlign: "right" }}>
            <Button
              onClick={onClose}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
              }}
            >
              Done
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default TeamManagementModal