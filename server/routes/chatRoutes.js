import express from 'express';
import { Conversation, Message } from '../models/Chat.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/chat/conversations - List user's conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email avatar year college')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 });

    // Format so the frontend sees the "other" student directly along with unread messages count
    const formatted = await Promise.all(conversations.map(async (c) => {
      const otherUser = c.participants.find(p => p._id.toString() !== req.user._id.toString());
      const unreadCount = await Message.countDocuments({
        conversation: c._id,
        receiver: req.user._id,
        read: false
      });
      return {
        _id: c._id,
        participant: otherUser || req.user,
        lastMessage: c.lastMessage,
        unreadCount,
        updatedAt: c.updatedAt
      };
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations.' });
  }
});

// GET /api/chat/messages/:targetUserId - Get message history with another student
router.get('/messages/:targetUserId', protect, async (req, res) => {
  try {
    const { targetUserId } = req.params;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, targetUserId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, targetUserId]
      });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { conversation: conversation._id, receiver: req.user._id, read: false },
      { read: true }
    );

    const targetUser = await User.findById(targetUserId).select('name email avatar year college rating');

    res.json({
      conversationId: conversation._id,
      targetUser,
      messages
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

// POST /api/chat/send - Send a message via REST (in addition to Socket.IO)
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Receiver and text message are required.' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId]
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim()
    });

    conversation.lastMessage = {
      text: text.trim(),
      sender: req.user._id,
      createdAt: new Date()
    };
    await conversation.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

// PUT /api/chat/read/:targetUserId - Mark messages as read explicitly
router.put('/read/:targetUserId', protect, async (req, res) => {
  try {
    const { targetUserId } = req.params;

    const conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, targetUserId] }
    });

    if (conversation) {
      await Message.updateMany(
        { conversation: conversation._id, receiver: req.user._id, read: false },
        { read: true }
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark messages as read.' });
  }
});

export default router;
