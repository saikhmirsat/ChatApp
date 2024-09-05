const Chat = require('../model/Chat');

// Handle incoming chat messages
const handleClientMessage = async (socket, ChatData) => {
    console.log(ChatData);

    try {
        // Create a new chat document
        const newChat = new Chat({
            sender: ChatData.sender,
            receiver: ChatData.receiverId,
            message: ChatData.message,
            messageType: ChatData.messageType || 'text', // Default to 'text'
            timestamp: new Date(ChatData.timestamp), // Convert timestamp to Date object
            seen: false, // Default to false
            seenAt: null // Default to null
        });

        // Save the chat message to the database
        await newChat.save();
        socket.broadcast.emit('ServerResponse', ChatData);

    } catch (error) {
        console.error('Error saving message:', error);
        // Handle error if needed
    }
};

// Mark messages as seen
const markMessageSeen = async (socket, messageIds) => {
    try {
        // Update the seen status of messages with the provided IDs
        await Chat.updateMany(
            { _id: { $in: messageIds } },
            { $set: { seen: true, seenAt: new Date() } }
        );

        // Emit the seen status update to the receiver
        socket.broadcast.emit('SeenUpdate', messageIds);
    } catch (error) {
        console.error('Error updating seen status:', error);
    }
};

module.exports = {
    handleClientMessage,
    markMessageSeen
};
