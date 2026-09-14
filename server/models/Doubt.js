import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const answerSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const doubtSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Doubt title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Data Structures & Algorithms',
      'Web Development',
      'Python & AI',
      'Database & SQL',
      'Computer Networks & OS',
      'Mathematics & Logic',
      'General'
    ],
    default: 'Web Development'
  },
  tags: [{
    type: String,
    trim: true
  }],
  answers: [answerSchema],
  resolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Doubt = mongoose.model('Doubt', doubtSchema);
