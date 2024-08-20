// index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const allRoutes = require('./routes/allRoutes');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

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

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
