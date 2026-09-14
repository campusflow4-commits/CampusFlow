import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  resourceType: {
    type: String,
    enum: ['Book', 'Link', 'Video', 'Other'],
    default: 'Book'
  },
  recommendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

export const Resource = mongoose.model('Resource', resourceSchema);
