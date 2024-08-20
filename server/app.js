// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const connectDB = require('./config/database');
// const errorHandler = require('./middleware/errorHandler');
// const allRoutes = require('./routes/allRoutes');
// const { Server } = require('socket.io');
// const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 5000;
// const server = http.createServer(app);
// const io = new Server(server);

// // Connect to the database
// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/chat-app', allRoutes);

// // Home Route
// app.get('/', (req, res) => {
//     res.json({
//         message: 'Welcome to the API',
//         api_version: '1.0',
//     });
// });

// // 404 Not Found Middleware
// app.use((req, res) => {
//     res.status(404).json({
//         message: "The requested API endpoint was not found",
//     });
// });

// // Error handling middleware
// app.use(errorHandler);

// // Socket.io setup
// io.on('connection', (socket) => {
//     console.log('New client connected');

//     socket.on('userOnline', (userId) => {
//         try {
//             console.log(`User ${userId} is online`);
//         } catch (error) {
//             console.error('Error handling userOnline event:', error);
//         }
//     });

//     socket.on('sendMessage', (messageData) => {
//         try {
//             // Add an _id to the messageData
//             const messageWithId = {
//                 ...messageData,
//                 _id: uuidv4(), // Generate a unique ID
//                 timestamp: new Date() // Ensure timestamp is also set
//             };

//             io.emit('receiveMessage', messageWithId);
//             console.log('Message sent:', messageWithId);
//         } catch (error) {
//             console.error('Error handling sendMessage event:', error);
//         }
//     });

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });

// // Start the server
// server.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');  // Use Express for routing
require('dotenv').config();
const port = process.env.PORT || 5000;

// Initialize Express
const app = express();

// Create an HTTP server and pass the Express app to it
let httpServer = createServer(app);

// Create a Socket.io server and attach it to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  }
});

let ChatNo = 0;
let Complexity = 4;
console.log("Everything is cool!");

// Handle connection event
io.on('connection', (socket) => {
  const { userId } = socket.handshake.query;
  console.log(`User connected: ${userId}`);

  // Emit a message to the client that the connection is successful
  socket.emit('server', { message: "Connected to server", userId });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
  });

  // Handle receiving an image
  socket.on('Image', (data) => {
    socket.broadcast.emit('incomingImage', data);
  });

  // Handle receiving a client message
  socket.on('ClientMessage', (ChatData) => {
    console.log(ChatData);
    socket.broadcast.emit('ServerResponse', ChatData);
  });
});

// Set up a route on the root URL ("/")
app.get('/', (req, res) => {
  res.send('Server is working');
});

// Start listening on the specified port
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
