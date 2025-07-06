import React, { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TaskCalendar = () => {
    const [events, setEvents] = useState([]);
    const { token } = useContext(AuthContext);

    const fetchTasksForCalendar = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: tasks } = await axios.get('http://localhost:5000/api/tasks', config);

            // transform tasks into calendar events format
            const calendarEvents = tasks
                .filter(task => task.deadline) // only tasks with deadlines
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
        }
    };

    useEffect(() => {
        if (token) {
            fetchTasksForCalendar();
        }
    }, [token]);

    const handleSelectEvent = (event) => {
        alert(`Task: ${event.title}\nStatus: ${event.resource.status}`);
    };

    return (
        <div style={{ height: '700px', margin: '20px 0' }}>
            <h3>Task Calendar</h3>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                views={['month', 'week', 'day']}
                defaultView="month"
            />
        </div>
    );
};

export default TaskCalendar;