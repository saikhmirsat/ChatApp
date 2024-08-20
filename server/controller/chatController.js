const Chat = require('../model/Chat');
const User = require('../model/user');

// Send a new message
exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message, messageType } = req.body;

        const senderUser = await User.findById(sender);
        const receiverUser = await User.findById(receiver);

        if (!senderUser || !receiverUser) {
            return res.status(404).json({ message: 'Sender or receiver not found.' });
        }

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
        const { userId, contactId } = req.params;

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

// Mark message as seen
exports.markAsSeen = async (req, res) => {
    try {
        const { messageId } = req.body;
        
        const message = await Chat.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        message.seen = true;
        message.seenAt = new Date();
        await message.save();

        res.status(200).json({
            success: true,
            message: 'Message marked as seen',
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as seen',
            error: error.message
        });
    }
};
