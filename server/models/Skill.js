import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Programming & Tech',
      'Data Science & AI',
      'Design & UI/UX',
      'Mathematics & Science',
      'Business & Marketing',
      'Languages & Writing',
      'Music & Arts',
      'Other'
    ],
    default: 'Programming & Tech'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  type: {
    type: String,
    enum: ['teach', 'learn'],
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

export const Skill = mongoose.model('Skill', skillSchema);
