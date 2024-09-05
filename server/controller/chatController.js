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
    const { messageIds } = req.body;

  try {
    // Update seen status for the provided message IDs
    await Chat.updateMany(
      { _id: { $in: messageIds } },
      { $set: { seen: true, seenAt: new Date() } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating seen status:', error);
    res.status(500).json({ success: false, error: 'Failed to update seen status' });
  }
};

exports.getUsersWithLastMessage = async (req, res) => {
    try {
        const userId = req.query.userId; // Logged-in user's ID

        // Find all users except the logged-in user
        const users = await User.find({ _id: { $ne: userId } });

        // Aggregate user data with their latest message and unseen count
        const userWithMessages = await Promise.all(users.map(async (user) => {
            // Get the most recent message for the user
            const recentMessage = await Chat.findOne({
                $or: [{ sender: user._id }, { receiver: user._id }]
            }).sort({ timestamp: -1 });

            // Count unseen messages for the logged-in user
            const unseenCount = await Chat.countDocuments({
                receiver: user._id,
                seen: false
            });

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                lastMessage: recentMessage ? {
                    message: recentMessage.message,
                    timestamp: recentMessage.timestamp,
                    unseenCount: unseenCount
                } : {
                    message: null,
                    timestamp: null,
                    unseenCount: 0
                }
            };
        }));

        res.json(userWithMessages);
    } catch (error) {
        console.error('Failed to fetch users with messages', error);
        res.status(500).json({ error: 'Failed to fetch users with messages' });
    }
};