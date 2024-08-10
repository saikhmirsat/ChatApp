const socketIo = require('socket.io');
const User = require('../model/user');
const Chat = require('../model/Chat'); // Import your chat model

module.exports = function (server) {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle user online status
        socket.on('userOnline', async (userId) => {
            try {
                await User.findByIdAndUpdate(userId, { isOnline: true, lastActive: new Date() });
                console.log(`User ${userId} is online`);
            } catch (error) {
                console.error('Failed to update user status:', error);
            }
        });

        // Handle user disconnect
        socket.on('disconnect', async () => {
            const userId = socket.userId; // Make sure to set this correctly
            try {
                await User.findByIdAndUpdate(userId, { isOnline: false, lastActive: new Date() });
                console.log(`User ${userId} is offline`);
            } catch (error) {
                console.error('Failed to update user status:', error);
            }
        });

        // Handle sending messages
        socket.on('sendMessage', async (message) => {
            try {
                const newMessage = await Chat.create(message);
                io.emit('receiveMessage', newMessage);
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        });

        // Handle updating message status
        socket.on('updateMessageStatus', async ({ messageId, seen }) => {
            try {
                await Chat.findByIdAndUpdate(messageId, { seen });
                console.log(`Message ${messageId} status updated to seen: ${seen}`);
            } catch (error) {
                console.error('Failed to update message status:', error);
            }
        });

        // Fetch message history
        socket.on('fetchMessages', async ({ userId, contactId }) => {
            try {
                const messages = await Chat.find({
                    $or: [
                        { sender: userId, receiver: contactId },
                        { sender: contactId, receiver: userId }
                    ]
                });
                socket.emit('messageHistory', messages);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        });
    });
};
