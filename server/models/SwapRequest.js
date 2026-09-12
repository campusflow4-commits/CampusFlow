import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOffered: {
    type: String,
    required: true,
    trim: true
  },
  skillRequested: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    default: 'Hi, I would like to exchange skills with you!'
  },
  creditCost: {
    type: Number,
    default: 15
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  ratingBySender: {
    stars: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' },
    ratedAt: { type: Date }
  },
  ratingByReceiver: {
    stars: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' },
    ratedAt: { type: Date }
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
