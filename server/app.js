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
const allRoutes = require('./routes/allRoutes');
const connectDB = require('./config/database');
const Chat = require('./model/Chat');

// Initialize Express
const app = express();
app.use(express.json());

// Create an HTTP server and pass the Express app to it
let httpServer = createServer(app);

// Create a Socket.io server and attach it to the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});

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

    // Handle receiving a message
    socket.on('ClientMessage', async (chatData) => {
        try {
            // Create a new chat document
            const newChat = new Chat({
                sender: chatData.senderId,
                receiver: chatData.receiverId,
                message: chatData.message,
                messageType: chatData.messageType || 'text', // Default to 'text'
                timestamp: new Date(chatData.timestamp), // Convert timestamp to Date object
                seen: false, // Default to false
                seenAt: null // Default to null
            });

            // Save the chat message to the database
            await newChat.save();

            // Emit the message to the intended receiver
            socket.to(chatData.receiverId).emit('ServerResponse', {
                _id: newChat._id,
                sender: newChat.sender,
                receiver: newChat.receiver,
                message: newChat.message,
                messageType: newChat.messageType,
                seen: newChat.seen,
                seenAt: newChat.seenAt,
                timestamp: newChat.timestamp,
            });
        } catch (error) {
            console.error('Error saving message:', error);
            // Handle error if needed
        }
    });

    // Handle marking messages as seen
    socket.on('MarkAsSeen', async (messageId) => {
        try {
            const message = await Chat.findById(messageId);
            if (message) {
                message.seen = true;
                message.seenAt = new Date();
                await message.save();

                // Optionally, notify the sender or other relevant parties
                socket.to(message.sender.toString()).emit('MessageSeen', messageId);
            }
        } catch (error) {
            console.error('Error marking message as seen:', error);
            // Handle error if needed
        }
    });
});

// Set up a route on the root URL ("/")
app.get('/', (req, res) => {
    res.send('Server is working');
});

app.use('/chat-app', allRoutes);

// Start listening on the specified port
httpServer.listen(port, () => {
    connectDB();
    console.log("Everything is cool!");
    console.log(`Server running on port ${port}`);
});
