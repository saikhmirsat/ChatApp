const Chat = require('../model/Chat');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle sending messages
        socket.on('sendMessage', async (messageData) => {
            try {
                const newMessage = new Chat(messageData);
                await newMessage.save();
                io.emit('receiveMessage', newMessage);
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        });

        // Handle receiving messages
        socket.on('fetchMessages', async (userIds) => {
            try {
                const messages = await Chat.find({
                    $or: [
                        { sender: userIds.userId, receiver: userIds.contactId },
                        { sender: userIds.contactId, receiver: userIds.userId }
                    ]
                }).sort({ timestamp: 1 });

                socket.emit('messageHistory', messages);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
