import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: [
      'initial_bonus',
      'teach_skill',
      'learn_skill',
      'video_reward',
      'quiz_reward',
      'referral_bonus',
      'admin_adjustment'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);
