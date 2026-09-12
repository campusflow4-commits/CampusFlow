import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Programming',
      'Web Development',
      'UI/UX Design',
      'Data Structures',
      'Artificial Intelligence',
      'Soft Skills & Career'
    ],
    default: 'Web Development'
  },
  duration: {
    type: String,
    default: '12 min'
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
  },
  creditReward: {
    type: Number,
    default: 10
  },
  order: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const videoProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  watched: {
    type: Boolean,
    default: true
  },
  watchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Composite unique index so a user can only record watching a specific video once
videoProgressSchema.index({ user: 1, video: 1 }, { unique: true });

export const Video = mongoose.model('Video', videoSchema);
export const VideoProgress = mongoose.model('VideoProgress', videoProgressSchema);
