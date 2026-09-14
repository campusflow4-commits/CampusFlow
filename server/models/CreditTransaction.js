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
      'WELCOME_BONUS',
      'TEACHING_REWARD',
      'LEARNING_COST',
      'SWAP_COMPLETION',
      'DOUBT_REWARD',
      'QUIZ_COMPLETION',
      'QUIZ_PERFORMANCE',
      'VIDEO_COMPLETION',
      'REFERRAL_REWARD',
      'ADMIN_ADJUSTMENT'
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
