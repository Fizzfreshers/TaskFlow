// client/src/components/TaskCalendar.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // for month view
import timeGridPlugin from '@fullcalendar/timegrid'; // for week and day views
import listPlugin from '@fullcalendar/list'; // for list/agenda view
import interactionPlugin from '@fullcalendar/interaction'; // for click events
import { Paper, Typography } from '@mui/material';

// The onTaskClick prop is passed from Dashboard.js to open the detail modal
const TaskCalendar = ({ onTaskClick, refreshTrigger }) => {
    const [events, setEvents] = useState([]);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data: tasks } = await axios.get('http://localhost:5000/api/tasks', config);
                
                // Map tasks to FullCalendar's event format
                const calendarEvents = tasks
                    .filter(task => task.deadline) // Make sure task has a deadline
                    .map(task => ({
                        id: task._id,
                        title: task.title,
                        date: task.deadline, // FullCalendar uses 'date' for the event time
                        extendedProps: {
                            // Store the full task object here
                            taskDetails: task,
                        }
                    }));
                setEvents(calendarEvents);
            } catch (error) {
                console.error("Failed to fetch tasks for calendar:", error);
            }
        };

        fetchTasks();
    }, [token, refreshTrigger]); // Re-fetch when the refreshTrigger changes

    // This handler is called when a user clicks on an event
    const handleEventClick = (clickInfo) => {
        // The full task object is in extendedProps
        if (clickInfo.event.extendedProps.taskDetails && onTaskClick) {
            onTaskClick(clickInfo.event.extendedProps.taskDetails);
        }
    };

    return (
        <Paper sx={{ p: 2, mt: 3, '.fc-button': { textTransform: 'capitalize' } }}>
            <Typography variant="h5" gutterBottom>Calendar</Typography>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                }}
                events={events}
                eventClick={handleEventClick}
                height="60vh"
            />
        </Paper>
    );
};

export default TaskCalendar;