import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { seedInitialData } from './utils/seedData.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import route handlers
import authRoutes from './routes/authRoutes.js';
import swapRoutes from './routes/swapRoutes.js';
import creditRoutes from './routes/creditRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables relative to this file
dotenv.config({ path: path.join(__dirname, '.env') });


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Setup Socket.IO for real-time messaging
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO real-time event handling
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  // Student registers their presence online
  socket.on('register_user', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
    }
  });

  // Join a direct chat room with another student
  socket.on('join_chat', ({ userId, targetUserId }) => {
    const roomId = [userId, targetUserId].sort().join('_');
    socket.join(roomId);
  });

  // Send real-time message
  socket.on('send_message', (data) => {
    const { senderId, receiverId, text, createdAt, senderName, senderAvatar, messageType, fileUrl, fileName, fileMimeType, fileSize, _id } = data;
    const roomId = [senderId, receiverId].sort().join('_');
    
    // Broadcast to the chat room
    io.to(roomId).emit('receive_message', {
      _id,
      senderId,
      receiverId,
      text,
      messageType,
      fileUrl,
      fileName,
      fileMimeType,
      fileSize,
      createdAt: createdAt || new Date(),
      senderName,
      senderAvatar
    });

    // Also notify receiver directly if they are outside the room
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message_notification', {
        senderId,
        senderName,
        text
      });
    }
  });

  // Edit message
  socket.on('edit_message', ({ messageId, senderId, receiverId, text }) => {
    const roomId = [senderId, receiverId].sort().join('_');
    socket.to(roomId).emit('message_edited', { messageId, text });
  });

  // Delete message
  socket.on('delete_message', ({ messageId, senderId, receiverId }) => {
    const roomId = [senderId, receiverId].sort().join('_');
    socket.to(roomId).emit('message_deleted', { messageId });
  });

  // WebRTC Signaling
  socket.on('call_user', ({ userToCall, signalData, from, name }) => {
    const receiverSocketId = onlineUsers.get(userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call_incoming', { signal: signalData, from, name });
    }
  });

  socket.on('answer_call', ({ to, signal }) => {
    const callerSocketId = onlineUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_accepted', signal);
    }
  });

  socket.on('reject_call', ({ to }) => {
    const callerSocketId = onlineUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_rejected');
    }
  });

  socket.on('end_call', ({ to }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call_ended');
    }
  });

  // Typing indicators
  socket.on('typing', ({ senderId, receiverId, isTyping }) => {
    const roomId = [senderId, receiverId].sort().join('_');
    socket.to(roomId).emit('user_typing', { senderId, isTyping });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users_list', Array.from(onlineUsers.keys()));
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    message: 'CampusFlow API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

// Start server & initialize MongoDB connection + demo data
server.listen(PORT, async () => {
  console.log(`\n🚀 CampusFlow Server & Socket.IO running on http://localhost:${PORT}`);
  console.log(`🩺 Health check available at: http://localhost:${PORT}/api/health`);
  
  const connected = await connectDB();
  if (connected) {
    await seedInitialData();
  }
});
