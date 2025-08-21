const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  socket.on('joinPollRoom', (pollId) => { socket.join(pollId); });
  socket.on('disconnect', () => {});
});
app.use((req, res, next) => { req.io = io; next(); });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server with Socket.IO started on port ${PORT}`));