const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app's address
    methods: ["GET", "POST"]
  }
});

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinPollRoom', (pollId) => {
    socket.join(pollId);
    console.log(`User ${socket.id} joined room ${pollId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Pass `io` to be accessible in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // New Admin Routes

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server with Socket.IO started on port ${PORT}`));