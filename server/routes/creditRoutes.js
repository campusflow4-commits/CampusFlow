import express from 'express';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/credits/history - Get student credit ledger
router.get('/history', protect, async (req, res) => {
  try {
    const transactions = await CreditTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const earned = transactions
      .filter(t => t.amount > 0)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const spent = Math.abs(
      transactions
        .filter(t => t.amount < 0)
        .reduce((acc, curr) => acc + curr.amount, 0)
    );

    res.json({
      currentBalance: req.user.credits,
      totalEarned: earned,
      totalSpent: spent,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve credit history.' });
  }
});

export default router;
