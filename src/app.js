const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const siteRoutes = require('./routes/siteRoutes');
const photoRoutes = require('./routes/photoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const servicesRoutes = require('./routes/servicesRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const inquiryRoutes = require('./routes/inquiryRoutes')
const videoRoutes = require('./routes/videoRoutes')
const holidayRoutes = require('./routes/holidayRoutes')
const estimationRoutes = require('./routes/estimationRoutes');
const notificationRoutes = require('./notifications/route');
const chatRoutes = require('./routes/chatRoutes');
const initializeChat = require('./socket/chatHandler');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
});

io.on("connection", (socket) => {
  console.log("⚡️ New client connected:", socket.id);

  // Example: Listen and emit
  socket.on("send_message", (data) => {
    console.log("📨 Message received:", data);
    io.emit("receive_message", data); // broadcast
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Initialize chat socket handler
initializeChat(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect("mongodb+srv://dairy:dairy123@dairy.pj8g1.mongodb.net/?retryWrites=true&w=majority&appName=dairy")
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to User Management API' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/services',servicesRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/inquiry', inquiryRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/holidays', holidayRoutes)
app.use('/api/estimations', estimationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is initialized`);
}); 