const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const connectDB = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

dotenv.config();

connectDB();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render)
const server = http.createServer(app);

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'https://projectproposalcss.netlify.app',
        'http://localhost:5173'
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(cookieParser());

// Health check for Render
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL,
            'https://projectproposalcss.netlify.app',
            'http://localhost:5173'
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
    }
});

// Store online users userId -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('register', (userId) => {
        if (userId) {
            const uidStr = userId.toString();
            onlineUsers.set(uidStr, socket.id);
            console.log(`[SOCKET] User registered: ${uidStr} on socket ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        let disconnectedUserId;
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                break;
            }
        }
        if (disconnectedUserId) {
            onlineUsers.delete(disconnectedUserId);
            console.log(`[SOCKET] User deregistered: ${disconnectedUserId}`);
        }
    });
});

app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    req.sendNotification = (userId, event, data) => {
        if (!userId) {
            console.log(`[SOCKET] SKIPPING SEND ${event} - No target userId.`);
            return;
        }
        const uidStr = userId.toString();
        const socketId = onlineUsers.get(uidStr);
        console.log(`[SOCKET] Sending ${event} to ${uidStr}. Status: ${socketId ? 'Sent' : 'Queueing/Offline'}`);
        if (socketId) {
            io.to(socketId).emit(event, data);
        }
    };
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/academic-sessions', require('./routes/academicSessionRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));

const PORT = process.env.PORT || 6001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
