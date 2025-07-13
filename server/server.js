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

const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
};

const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());

// Attach io instance to every request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO Connection Logic
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('userOnline', async (userId) => {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            socket.join(userId); // Have the socket join a room named after its own user ID.
            socket.userId = userId; // Attach userId to the socket instance for later use.
            await User.findByIdAndUpdate(userId, { isOnline: true });
            io.emit('userStatusChange', { userId, isOnline: true });
            console.log(`User ${userId} is now online.`);
        }
    });

    socket.on('disconnect', async () => {
        if (socket.userId && mongoose.Types.ObjectId.isValid(socket.userId)) {
            await User.findByIdAndUpdate(socket.userId, { isOnline: false });
            io.emit('userStatusChange', { userId: socket.userId, isOnline: false });
            console.log(`User ${socket.userId} disconnected.`);
        }
        console.log(`A user disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});