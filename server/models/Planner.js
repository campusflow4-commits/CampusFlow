import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

const deadlineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'high'
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const practicalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'verified'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const timetableSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true // e.g. "09:00 AM"
  },
  endTime: {
    type: String,
    required: true // e.g. "10:30 AM"
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    default: 'Online / Lab'
  },
  color: {
    type: String,
    default: '#6366f1'
  }
}, {
  timestamps: true
});

export const Todo = mongoose.model('Todo', todoSchema);
export const Deadline = mongoose.model('Deadline', deadlineSchema);
export const Practical = mongoose.model('Practical', practicalSchema);
export const Timetable = mongoose.model('Timetable', timetableSchema);
