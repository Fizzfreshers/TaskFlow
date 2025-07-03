require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks',taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a user logs in, they send their userId
    socket.on('userOnline', async (userId) => {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            await User.findByIdAndUpdate(userId, { isOnline: true });
            socket.userId = userId; // Store userId on socket for disconnect
            // Broadcast to all connected clients that a user came online
            io.emit('userStatusChange', { userId, isOnline: true });
            console.log(`User ${userId} is now online`);
        }
    });

    // When a user disconnects
    socket.on('disconnect', async () => {
        if (socket.userId && mongoose.Types.ObjectId.isValid(socket.userId)) {
            await User.findByIdAndUpdate(socket.userId, { isOnline: false });
            io.emit('userStatusChange', { userId: socket.userId, isOnline: false });
            console.log(`User ${socket.userId} disconnected`);
        }
        console.log(`User disconnected: ${socket.id}`);
    });

    // Notification for task assignment/completion
    socket.on('taskNotification', (data) => {
        // data should contain { type: 'assigned'/'completed', task: taskDetails, recipientUserIds: [] }
        data.recipientUserIds.forEach(userId => {
            // Find all sockets belonging to this userId and emit notification
            io.to(userId).emit('newNotification', data); // Assuming users join rooms by their ID
        });
    });
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

// start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});