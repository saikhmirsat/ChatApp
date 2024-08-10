const Chat = require('../model/Chat');

// Send a new message
exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message, messageType } = req.body;

        const newMessage = new Chat({
            sender,
            receiver,
            message,
            messageType
        });

        await newMessage.save();

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

// Fetch messages between two users
exports.getMessages = async (req, res) => {
    try {
        const { userId, contactId } = req.query;

        const messages = await Chat.find({
            $or: [
                { sender: userId, receiver: contactId },
                { sender: contactId, receiver: userId }
            ]
        }).sort({ timestamp: 1 }); // Sort messages by timestamp

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};
