import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    enum: [
      'Inappropriate Behavior',
      'No-Show for Swap Session',
      'Spam or Harassment',
      'Misleading Skill Info',
      'Technical Glitch / Bug',
      'Other'
    ],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    trim: true
  },
  relatedContent: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewing', 'Resolved'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Report = mongoose.model('Report', reportSchema);
