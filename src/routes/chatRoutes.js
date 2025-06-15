const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get chat history between admin and employee
router.get('/history/:userId', auth, async (req, res) => {
  try {
    console.log('====================================');
    console.log(req);
    console.log('====================================');
    const messages = await Message.find({
      $or: [
        { sender: req.params.userId },
        {  receiver: req.params.userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name')
    .populate('receiver', 'name');
    console.log('====================================');
    console.log(messages);
    console.log('====================================');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Get all conversations for admin
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log(req.user);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can access all conversations' });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]);
console.log(conversations)
    // Return 200 with empty array if no conversations found
    if (!conversations || conversations.length === 0) {
      return res.status(200).json([]);
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

module.exports = router; 