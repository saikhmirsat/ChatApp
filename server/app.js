const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const allRoutes = require('./routes/allRoutes');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server);

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/chat-app', allRoutes);

// Home Route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API',
        api_version: '1.0',
    });
});

// 404 Not Found Middleware
app.use((req, res) => {
    res.status(404).json({
        message: "The requested API endpoint was not found",
    });
});

// Error handling middleware
app.use(errorHandler);

// Socket.io setup
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('userOnline', (userId) => {
        try {
            console.log(`User ${userId} is online`);
        } catch (error) {
            console.error('Error handling userOnline event:', error);
        }
    });

    socket.on('sendMessage', (messageData) => {
        try {
            // Add an _id to the messageData
            const messageWithId = {
                ...messageData,
                _id: uuidv4(), // Generate a unique ID
                timestamp: new Date() // Ensure timestamp is also set
            };

            io.emit('receiveMessage', messageWithId);
            console.log('Message sent:', messageWithId);
        } catch (error) {
            console.error('Error handling sendMessage event:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
