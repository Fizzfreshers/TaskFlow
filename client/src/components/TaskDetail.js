import { Box, Typography, Chip, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper } from "@mui/material"

const statusConfig = {
  pending: { color: "#f59e0b", bg: "#fef3c7", label: "Pending" },
  "in-progress": { color: "#3b82f6", bg: "#dbeafe", label: "In Progress" },
  completed: { color: "#10b981", bg: "#d1fae5", label: "Completed" },
}

const TaskDetail = ({ task }) => {
  if (!task) return null

  const statusInfo = statusConfig[task.status] || statusConfig.pending
  const formattedDate = task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline"

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 500, mb: 2 }}>
        {task.title}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, alignItems: "center" }}>
        <Chip
          label={statusInfo.label}
          sx={{
            bgcolor: statusInfo.bg,
            color: statusInfo.color,
            fontWeight: 500,
            border: `1px solid ${statusInfo.color}20`,
            px: 1,
          }}
        />

        <Typography variant="body2" color="text.secondary">
          Due: {formattedDate}
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: "background.surface",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
          Description
        </Typography>
        <Typography variant="body1">{task.description || "No description provided."}</Typography>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Assigned Users
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
        <List>
          {task.assignedTo && task.assignedTo.length > 0 ? (
            task.assignedTo.map((user) => (
              <ListItem key={user._id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>{user.name.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={user.email} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No individual users assigned." />
            </ListItem>
          )}
        </List>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Assigned Teams
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <List>
          {task.teams && task.teams.length > 0 ? (
            task.teams.map((team) => (
              <ListItem key={team._id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.light" }}>{team.name.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={team.name} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No teams assigned." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  )
}

export default TaskDetail