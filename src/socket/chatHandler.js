const Message = require('../models/Message');
const User = require('../models/User');
const { sendDirectNotification } = require('../notifications/controller');

const connectedUsers = new Map();

const initializeChat = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection attempt:', {
      id: socket.id,
      handshake: {
        address: socket.handshake.address,
        headers: socket.handshake.headers,
        query: socket.handshake.query
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error for socket:', socket.id, error);
    });

    // Handle connection timeout
    socket.on('connect_timeout', (timeout) => {
      console.error('Connection timeout for socket:', socket.id, timeout);
    });

    // Handle user authentication and store their socket ID
    socket.on('authenticate', async (userId) => {
      try {
        console.log('Authentication attempt for user:', userId, 'socket:', socket.id);
        const user = await User.findById(userId);
        if (user) {
          connectedUsers.set(userId, socket.id);
          socket.userId = userId;
          console.log(`User ${userId} authenticated successfully with socket ${socket.id}`);
          socket.emit('authenticated', { success: true });
        } else {
          console.log(`User ${userId} not found for socket ${socket.id}`);
          socket.emit('authenticated', { success: false, error: 'User not found' });
        }
      } catch (error) {
        console.error('Authentication error for socket:', socket.id, error);
        socket.emit('authenticated', { success: false, error: 'Authentication failed' });
      }
    });

    // Handle new messages
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content } = data;
        const senderId = socket.userId;

        // Get sender's role
        const sender = await User.findById(senderId);
        if (!sender) {
          throw new Error('Sender not found');
        }

        let receivers = [];
        let message = null;
        let admins = [];
        
        if (sender.role !== 'admin') {
          // If sender is not admin, send to all admins
          admins = await User.find({ role: 'admin' });
          receivers = admins.map(admin => admin._id);
          // Save message with first admin as receiver
          message = new Message({
            sender: senderId,
            receiver: receivers[0],
            content
          });
          await message.save();
          await message.populate('sender', 'name');
          await message.populate('receiver', 'name');
        } else {
          // If sender is admin, send to specified receiver
          receivers = [receiverId];
          message = new Message({
            sender: senderId,
            receiver: receiverId,
            content
          });
          await message.save();
          await message.populate('sender', 'name');
          await message.populate('receiver', 'name');
        }

        // Send to all receivers: if online, send real-time; if offline, send notification
        for (const recvId of receivers) {
          const receiverSocketId = connectedUsers.get(recvId.toString());
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', message);
          } else {
            try {
              await sendDirectNotification({
                userId: recvId.toString(),
                title: `New message from ${message.sender.name}`,
                body: message.content
              });
            } catch (error) {
              console.error('Error sending push notification:', error);
            }
          }
        }

        // Send confirmation to sender
        socket.emit('messageSent', message);
        console.log("sent");
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Handle message read status
    socket.on('markAsRead', async (messageId) => {
      try {
        const message = await Message.findById(messageId);
        if (message && message.receiver.toString() === socket.userId) {
          message.isRead = true;
          await message.save();

          // Notify sender if online
          const senderSocketId = connectedUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageRead', messageId);
          }
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log('User disconnected:', socket.userId);
      }
    });
  });
};

module.exports = initializeChat; 