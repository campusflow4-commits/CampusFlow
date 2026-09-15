import express from 'express';
import { SwapRequest } from '../models/SwapRequest.js';
import { QuizAttempt } from '../models/Quiz.js';
import { VideoProgress } from '../models/Video.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { Message } from '../models/Chat.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/stats/notifications - Real-time notification counters & items for Navbar
router.get('/notifications', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [pendingSwaps, pendingSwapsCount, unreadMessages, unreadMessagesCount] = await Promise.all([
      SwapRequest.find({ receiver: userId, status: 'pending' })
        .populate('sender', 'name avatar year')
        .sort({ createdAt: -1 })
        .limit(5),
      SwapRequest.countDocuments({ receiver: userId, status: 'pending' }),
      Message.find({ receiver: userId, read: false })
        .populate('sender', 'name avatar year')
        .sort({ createdAt: -1 })
        .limit(5),
      Message.countDocuments({ receiver: userId, read: false })
    ]);

    res.json({
      pendingSwapsCount,
      unreadMessagesCount,
      totalCount: pendingSwapsCount + unreadMessagesCount,
      pendingSwaps,
      unreadMessages
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notification summary.' });
  }
});

// GET /api/stats/progress - Recharts-ready learning & activity progression
router.get('/progress', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Completed swaps as learner vs teacher
    const completedLearnerSwaps = await SwapRequest.countDocuments({ receiver: userId, status: 'completed' });
    const completedTeacherSwaps = await SwapRequest.countDocuments({ sender: userId, status: 'completed' });

    // Quizzes passed
    const totalQuizAttempts = await QuizAttempt.countDocuments({ user: userId });
    const passedQuizzes = await QuizAttempt.countDocuments({ user: userId, passed: true });

    // Videos watched
    const totalVideosWatched = await VideoProgress.countDocuments({ user: userId });

    // 6-Month activity aggregation for Recharts Line & Bar charts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const matchCriteria = {
      createdAt: { $gte: sixMonthsAgo }
    };

    const monthlyStatsMap = {};
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      months.push(monthStr);
      monthlyStatsMap[monthStr] = {
        month: monthStr,
        skillsLearned: 0,
        skillsTaught: 0,
        creditsEarned: 0,
        quizzesTaken: 0
      };
    }

    const learnerSwapsHistory = await SwapRequest.aggregate([
      { $match: { receiver: userId, status: 'completed', updatedAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $month: "$updatedAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    const teacherSwapsHistory = await SwapRequest.aggregate([
      { $match: { sender: userId, status: 'completed', updatedAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $month: "$updatedAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    const quizHistory = await QuizAttempt.aggregate([
      { $match: { user: userId, createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    const creditsHistory = await CreditTransaction.aggregate([
      { $match: { user: userId, amount: { $gt: 0 }, createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const getMonthStr = (monthNum) => {
      const d = new Date();
      d.setMonth(monthNum - 1);
      return d.toLocaleString('default', { month: 'short' });
    };

    learnerSwapsHistory.forEach(item => {
      const m = getMonthStr(item._id);
      if (monthlyStatsMap[m]) monthlyStatsMap[m].skillsLearned = item.count;
    });

    teacherSwapsHistory.forEach(item => {
      const m = getMonthStr(item._id);
      if (monthlyStatsMap[m]) monthlyStatsMap[m].skillsTaught = item.count;
    });

    quizHistory.forEach(item => {
      const m = getMonthStr(item._id);
      if (monthlyStatsMap[m]) monthlyStatsMap[m].quizzesTaken = item.count;
    });

    creditsHistory.forEach(item => {
      const m = getMonthStr(item._id);
      if (monthlyStatsMap[m]) monthlyStatsMap[m].creditsEarned = item.total;
    });

    const monthlySkillGrowth = months.map(m => monthlyStatsMap[m]);

    const categoryDistributionAgg = await QuizAttempt.aggregate([
      { $match: { user: userId } },
      { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quizDoc' } },
      { $unwind: '$quizDoc' },
      { $group: {
          _id: '$quizDoc.category',
          value: { $sum: 1 }
        }
      }
    ]);

    const defaultColors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];
    const categoryDistribution = categoryDistributionAgg.map((item, index) => ({
      name: item._id,
      value: item.value,
      color: defaultColors[index % defaultColors.length]
    }));

    if (categoryDistribution.length === 0) {
      categoryDistribution.push({ name: 'No Data Yet', value: 1, color: '#64748b' });
    }

    res.json({
      summary: {
        totalCredits: req.user.credits,
        rating: req.user.rating,
        totalRatings: req.user.totalRatings,
        skillsLearned: completedLearnerSwaps,
        skillsTaught: completedTeacherSwaps,
        quizzesPassed: passedQuizzes,
        videosWatched: totalVideosWatched,
        streakDays: req.user.currentStreak
      },
      monthlySkillGrowth,
      categoryDistribution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to compile student analytics.' });
  }
});

export default router;
