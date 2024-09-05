const { Server } = require('socket.io');
const User = require('./model/user');

const setupSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        const { userId } = socket.handshake.query;
        console.log(`User connected: ${userId}`);

        socket.join(userId);

        User.findByIdAndUpdate(userId, { isOnline: true, lastActive: new Date() }, { new: true })
            .then(() => console.log(`User ${userId} is now online`))
            .catch((err) => console.error('Error updating user status:', err));

        socket.on('CallInitiate', async ({ senderId, receiverId }) => {
            console.log('Initiating call from:', senderId, 'to:', receiverId);
            
            try {
                await User.findByIdAndUpdate(senderId, { isCall: 'calling' });
                await User.findByIdAndUpdate(receiverId, { isCall: 'calling' });
        
                io.to(receiverId).emit('IncomingCall', { senderId });
                console.log('Emitted IncomingCall to receiver:', receiverId);
            } catch (error) {
                console.error('Error initiating call:', error);
            }
        });

        socket.on('CallResponse', async ({ receiverId, senderId, action }) => {
            try {
                if (action === 'accept') {
                    await User.findByIdAndUpdate(receiverId, { isCall: 'onCall' });
                    await User.findByIdAndUpdate(senderId, { isCall: 'onCall' });

                    io.to(senderId).emit('CallAccepted', { receiverId, message: "Call accepted" });
                    console.log(`User ${receiverId} accepted the call from User ${senderId}`);
                } else if (action === 'reject') {
                    await User.findByIdAndUpdate(receiverId, { isCall: 'available' });
                    await User.findByIdAndUpdate(senderId, { isCall: 'available' });

                    io.to(senderId).emit('CallRejected', { receiverId, message: "Call rejected" });
                    console.log(`User ${receiverId} rejected the call from User ${senderId}`);
                }
            } catch (error) {
                console.error('Error handling call response:', error);
            }
        });

        socket.on('EndCall', async ({ senderId, receiverId, initiator }) => {
            console.log(`Ending call. Initiator: ${initiator}, Sender ID: ${senderId}, Receiver ID: ${receiverId}`);
        
            try {
                if (!senderId || !receiverId) {
                    console.error('Missing senderId or receiverId in EndCall event');
                    return;
                }
        
                await User.findByIdAndUpdate(senderId, { isCall: 'available' });
                await User.findByIdAndUpdate(receiverId, { isCall: 'available' });
        
                io.to(senderId).emit('CallEnded', { receiverId, message: 'Call has ended', initiator });
                io.to(receiverId).emit('CallEnded', { senderId, message: 'Call has ended', initiator });
                console.log(`Call ended between User ${senderId} and User ${receiverId}. Initiated by: ${initiator}`);
            } catch (error) {
                console.error('Error ending call:', error);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);

            await User.findByIdAndUpdate(userId, { isOnline: false, lastActive: new Date(), isCall: 'available' });
            console.log(`User ${userId} is now offline and available`);
        });
    });
};

module.exports = { setupSocket };