

// const { createServer } = require('http');
// const { Server } = require('socket.io');
// const express = require('express');  // Use Express for routing
// require('dotenv').config();
// const port = process.env.PORT || 5000;
// const allRoutes = require('./routes/allRoutes');
// const connectDB = require('./config/database');
// const Chat = require('./model/Chat');
// const User = require('./model/user');


// // Initialize Express
// const app = express();
// app.use(express.json());

// // Create an HTTP server and pass the Express app to it
// let httpServer = createServer(app);

// // Create a Socket.io server and attach it to the HTTP server
// const io = new Server(httpServer, {
//     cors: {
//         origin: "*",
//         methods: ['GET', 'POST']
//     }
// });


// // Handle connection event
// io.on('connection', (socket) => {
//     const { userId } = socket.handshake.query;
//     console.log(`User connected: ${userId}`);

//     // Emit a message to the client that the connection is successful
//     socket.emit('server', { message: "Connected to server", userId });

//     // Set user as online and update lastActive
//     User.findByIdAndUpdate(userId, { isOnline: true, lastActive: new Date() }, { new: true })
//         .then(() => console.log(`User ${userId} is now online`))
//         .catch((err) => console.error('Error updating user status:', err));

//     // Handle disconnection
//     socket.on('disconnect', () => {
//         console.log(`User disconnected: ${userId}`);

//         // Set user as offline and update lastActive
//         User.findByIdAndUpdate(userId, { isOnline: false, lastActive: new Date() }, { new: true })
//             .then(() => console.log(`User ${userId} is now offline`))
//             .catch((err) => console.error('Error updating user status:', err));
//     });

//     // Handle receiving an image
//     socket.on('Image', (data) => {
//         socket.broadcast.emit('incomingImage', data);
//     });

//     // Handle receiving a client message
//     socket.on('ClientMessage',async (ChatData) => {
//         console.log(ChatData);

//         try {
//             // Create a new chat document
//             const newChat = new Chat({
//                 sender: ChatData.sender,
//                 receiver: ChatData.receiverId,
//                 message: ChatData.message,
//                 messageType: ChatData.messageType || 'text', // Default to 'text'
//                 timestamp: new Date(ChatData.timestamp), // Convert timestamp to Date object
//                 seen: false, // Default to false
//                 seenAt: null // Default to null
//             });

//             // Save the chat message to the database
//             await newChat.save();
//             socket.broadcast.emit('ServerResponse', ChatData);
          
//         } catch (error) {
//             console.error('Error saving message:', error);
//             // Handle error if needed
//         }

//     });

//      // Event to update seen status for messages
//      socket.on('MarkMessageSeen', async (messageIds) => {
//         try {
//             // Update the seen status of messages with the provided IDs
//             await Chat.updateMany(
//                 { _id: { $in: messageIds } },
//                 { $set: { seen: true, seenAt: new Date() } }
//             );

//             // Emit the seen status update to the receiver
//             socket.broadcast.emit('SeenUpdate', messageIds);
//         } catch (error) {
//             console.error('Error updating seen status:', error);
//         }
//     });
// });

// // Set up a route on the root URL ("/")
// app.get('/', (req, res) => {
//     res.send('Server is working');
// });

// app.use('/chat-app', allRoutes);


// // Start listening on the specified port
// httpServer.listen(port, () => {
//     connectDB();
//     console.log("Everything is cool!");
//     console.log(`Server running on port ${port}`);
// });

const { createServer } = require('http');
const express = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;
const allRoutes = require('./routes/allRoutes');
const connectDB = require('./config/database');
const { setupSocket } = require('./socket'); // Import socket setup

// Initialize Express
const app = express();
app.use(express.json());

// Create an HTTP server and pass the Express app to it
let httpServer = createServer(app);

// Setup socket server
setupSocket(httpServer); // Attach socket functionality

// Set up a route on the root URL ("/")
app.get('/', (req, res) => {
    res.send('Server is working');
});

// Use the chat routes
app.use('/chat-app', allRoutes);

// Start listening on the specified port
httpServer.listen(port, () => {
    connectDB();
    console.log(`Server running on port ${port}`);
});
