import express from 'express';
import { Video, VideoProgress } from '../models/Video.js';
import { User } from '../models/User.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/videos - List all videos with user's watched status
router.get('/', protect, async (req, res) => {
  try {
    const videos = await Video.find().sort({ order: 1 });
    const userProgress = await VideoProgress.find({ user: req.user._id });
    const watchedIds = new Set(userProgress.map(p => p.video.toString()));

    const formatted = videos.map(v => ({
      _id: v._id,
      title: v.title,
      description: v.description,
      category: v.category,
      duration: v.duration,
      videoUrl: v.videoUrl,
      thumbnail: v.thumbnail,
      creditReward: v.creditReward,
      isWatched: watchedIds.has(v._id.toString())
    }));

    const watchedCount = watchedIds.size;
    const canClaim5VideoReward = watchedCount >= 5 && !req.user.reward5VideosClaimed;

    res.json({
      videos: formatted,
      totalWatched: watchedCount,
      targetForReward: 5,
      canClaim5VideoReward,
      rewardClaimed: req.user.reward5VideosClaimed
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch videos.' });
  }
});

// POST /api/videos/:id/watch - Mark a video as watched
router.post('/:id/watch', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found.' });

    // Check if already watched
    let progress = await VideoProgress.findOne({ user: req.user._id, video: video._id });
    if (!progress) {
      await VideoProgress.create({
        user: req.user._id,
        video: video._id,
        watched: true
      });

      // Increment user's watched count
      const user = await User.findById(req.user._id);
      user.watchedVideosCount += 1;
      await user.save();
    }

    // Count distinct watched videos
    const totalWatched = await VideoProgress.countDocuments({ user: req.user._id });
    const user = await User.findById(req.user._id);

    let rewardAwarded = false;
    let rewardMessage = 'Video completed!';

    // Feature 9: Automatic or triggered reward after watching 5 distinct videos
    if (totalWatched >= 5 && !user.reward5VideosClaimed) {
      user.credits += 50;
      user.reward5VideosClaimed = true;
      await user.save();

      await CreditTransaction.create({
        user: user._id,
        amount: 50,
        type: 'video_reward',
        description: 'Milestone Reward: Watched 5 skill-building educational videos',
        balanceAfter: user.credits
      });

      rewardAwarded = true;
      rewardMessage = '🎉 Milestone Achieved! You watched 5 videos and earned 50 bonus credits!';
    }

    res.json({
      message: rewardMessage,
      totalWatched,
      rewardAwarded,
      newCreditsBalance: user.credits
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record video watch progress.' });
  }
});

export default router;
