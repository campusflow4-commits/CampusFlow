import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(v);
      },
      message: 'Only official @gmail.com addresses are permitted on CampusFlow.'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  year: {
    type: String,
    required: [true, 'Academic year is required'],
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Alumni']
  },
  college: {
    type: String,
    default: 'Engineering & Technology Institute',
    trim: true
  },
  bio: {
    type: String,
    default: 'Student passionate about sharing skills and learning new technologies.',
    maxLength: 300
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/bottts/svg?seed=student'
  },
  credits: {
    type: Number,
    default: 50 // 50 Starter Credits
  },
  rating: {
    type: Number,
    default: 5.0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  skillsToTeach: [{
    type: String,
    trim: true
  }],
  skillsToLearn: [{
    type: String,
    trim: true
  }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  projects: [{
    title: String,
    link: String,
    description: String
  }],
  currentStreak: {
    type: Number,
    default: 1
  },
  activeDeviceId: {
    type: String,
    default: null // Single Device Session Protection
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  trialStartDate: {
    type: Date,
    default: Date.now
  },
  trialEndDate: {
    type: Date,
    default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 Days Free Trial
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: String,
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  watchedVideosCount: {
    type: Number,
    default: 0
  },
  reward5VideosClaimed: {
    type: Boolean,
    default: false
  },
  isDemoUser: {
    type: Boolean,
    default: false
  },
  fontPreference: {
    type: String,
    default: 'system'
  },
  dashboardPreferences: {
    type: Object,
    default: { collapsed: false }
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
