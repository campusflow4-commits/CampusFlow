import express from 'express';
import { Conversation, Message } from '../models/Chat.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads/chat';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `chat-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos/docs
});

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

// POST /api/chat/upload - Upload a chat attachment
router.post('/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return the file path
  const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
  res.status(201).json({
    fileUrl,
    fileName: req.file.originalname,
    fileMimeType: req.file.mimetype,
    fileSize: req.file.size
  });
});

// POST /api/chat/send - Send a message via REST (in addition to Socket.IO)
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, text, messageType, fileUrl, fileName, fileMimeType, fileSize } = req.body;

    if (!receiverId || (!text && !fileUrl)) {
      return res.status(400).json({ message: 'Receiver and message content are required.' });
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
      text: text ? text.trim() : '',
      messageType: messageType || 'text',
      fileUrl,
      fileName,
      fileMimeType,
      fileSize
    });

    conversation.lastMessage = {
      text: text ? text.trim() : (messageType || 'file'),
      sender: req.user._id,
      createdAt: new Date()
    };
    await conversation.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

// PATCH /api/chat/messages/:messageId - Edit a message
router.patch('/messages/:messageId', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }
    if (message.isDeleted) {
      return res.status(400).json({ message: 'Cannot edit a deleted message' });
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit message.' });
  }
});

// DELETE /api/chat/messages/:messageId - Soft delete a message
router.delete('/messages/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    // We could clear text/file Urls, but keeping them as soft delete allows admin viewing if needed.
    // Frontend will hide the content.
    await message.save();

    res.json({ message: 'Message deleted', id: message._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message.' });
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
