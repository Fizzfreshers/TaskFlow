"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"
import { Box, Typography, useTheme } from "@mui/material"

const TaskCalendar = ({ onTaskClick, refreshTrigger }) => {
  const [events, setEvents] = useState([])
  const { token } = useContext(AuthContext)
  const theme = useTheme()

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        const { data: tasks } = await axios.get("http://localhost:5000/api/tasks", config)

        const calendarEvents = tasks
          .filter((task) => task.deadline)
          .map((task) => {
            let color = theme.palette.primary.main
            if (task.status === "completed") {
              color = theme.palette.success.main
            } else if (task.status === "in-progress") {
              color = theme.palette.info.main
            } else if (task.status === "pending") {
              color = theme.palette.warning.main
            }

            return {
              id: task._id,
              title: task.title,
              date: task.deadline,
              backgroundColor: color,
              borderColor: color,
              textColor: "#fff",
              extendedProps: {
                taskDetails: task,
              },
            }
          })
        setEvents(calendarEvents)
      } catch (error) {
        console.error("Failed to fetch tasks for calendar:", error)
      }
    }

    fetchTasks()
  }, [token, refreshTrigger, theme])

  const handleEventClick = (clickInfo) => {
    if (clickInfo.event.extendedProps.taskDetails && onTaskClick) {
      onTaskClick(clickInfo.event.extendedProps.taskDetails)
    }
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, flexShrink: 0 }}>
        Calendar
      </Typography>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          "& .fc": {
            height: "100%",
          },
          "& .fc-theme-standard td, & .fc-theme-standard th": {
            borderColor: theme.palette.divider,
          },
          "& .fc-button": {
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            textTransform: "none",
            fontWeight: 500,
            borderRadius: "8px",
            fontSize: "0.8rem",
            padding: "6px 12px",
            minHeight: "32px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
              borderColor: theme.palette.primary.dark,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
            "&:focus": {
              boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
            },
            "&:disabled": {
              backgroundColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
          },
          "& .fc-button-active": {
            backgroundColor: theme.palette.primary.dark,
            borderColor: theme.palette.primary.dark,
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
          },
          "& .fc-today-button": {
            backgroundColor: "transparent",
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
              borderColor: theme.palette.primary.main,
            },
          },
          "& .fc-toolbar": {
            marginBottom: "12px",
            gap: "8px",
          },
          "& .fc-toolbar-chunk": {
            display: "flex",
            alignItems: "center",
            gap: "6px",
          },
          "& .fc-button-group": {
            "& .fc-button": {
              marginLeft: "0",
              marginRight: "4px",
              "&:first-of-type": {
                borderTopRightRadius: "8px",
                borderBottomRightRadius: "8px",
              },
              "&:last-of-type": {
                borderTopLeftRadius: "8px",
                borderBottomLeftRadius: "8px",
              },
            },
          },
          "& .fc-daygrid-day": {
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
          "& .fc-event": {
            borderRadius: "4px",
            border: "none",
            fontSize: "0.7rem",
            fontWeight: 500,
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          },
          "& .fc-toolbar-title": {
            fontSize: "1.1rem",
            fontWeight: 500,
            color: theme.palette.text.primary,
          },
          "& .fc-col-header-cell": {
            backgroundColor: theme.palette.background.surface,
            color: theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            padding: "8px 4px",
          },
          "& .fc-daygrid-day-number": {
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: "0.8rem",
          },
          "& .fc-day-today": {
            backgroundColor: `${theme.palette.primary.main}08`,
            "& .fc-daygrid-day-number": {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
          },
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          events={events}
          eventClick={handleEventClick}
          height="100%"
          dayMaxEvents={2}
          moreLinkClick="popover"
          eventDisplay="block"
          aspectRatio={1.2}
        />
      </Box>
    </Box>
  )
}

export default TaskCalendar