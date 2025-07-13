import React, { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const localizer = momentLocalizer(moment);

const TaskCalendar = ({ onTaskClick }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    const fetchTasksForCalendar = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: tasks } = await axios.get('http://localhost:5000/api/tasks', config);
            const calendarEvents = tasks
                .filter(task => task.deadline)
                .map(task => ({
                    id: task._id,
                    title: task.title,
                    start: new Date(task.deadline),
                    end: new Date(task.deadline),
                    allDay: true,
                    resource: task,
                }));
            setEvents(calendarEvents);
        } catch (error) {
            console.error('Error fetching tasks for calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasksForCalendar();
    }, [token]);

    const handleSelectEvent = (event) => {
        if (event.resource) {
            onTaskClick(event.resource);
        }
    };
    
    if (loading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;

    return (
        <Paper sx={{ height: '50vh', p: 2, mt: 3 }}>
            <Typography variant="h5" gutterBottom>Calendar</Typography>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100% - 48px)' }}
                onSelectEvent={handleSelectEvent}
            />
        </Paper>
    );
};

export default TaskCalendar;