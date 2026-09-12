import express from 'express';
import { Doubt } from '../models/Doubt.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/doubts - Get doubts with search and category filters
router.get('/', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const doubts = await Doubt.find(query)
      .populate('author', 'name avatar year')
      .populate('answers.author', 'name avatar year')
      .populate('answers.comments.author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doubts.' });
  }
});

// POST /api/doubts - Post a new doubt
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide a title and detailed description for your doubt.' });
    }

    const doubt = await Doubt.create({
      author: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Web Development',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
    });

    const populated = await Doubt.findById(doubt._id).populate('author', 'name avatar year');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to post doubt.' });
  }
});

// POST /api/doubts/:id/answer - Add an answer to a doubt
router.post('/:id/answer', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Answer text cannot be empty.' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found.' });

    doubt.answers.push({
      author: req.user._id,
      text: text.trim(),
      upvotes: [],
      comments: []
    });

    await doubt.save();

    const updated = await Doubt.findById(doubt._id)
      .populate('author', 'name avatar year')
      .populate('answers.author', 'name avatar year')
      .populate('answers.comments.author', 'name avatar');

    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add answer.' });
  }
});

// POST /api/doubts/:id/answers/:answerId/upvote - Upvote an answer
router.post('/:id/answers/:answerId/upvote', protect, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found.' });

    const answer = doubt.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found.' });

    const userIdStr = req.user._id.toString();
    const upvoteIndex = answer.upvotes.findIndex(id => id.toString() === userIdStr);

    if (upvoteIndex > -1) {
      // Toggle off upvote
      answer.upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote
      answer.upvotes.push(req.user._id);
    }

    await doubt.save();

    const updated = await Doubt.findById(doubt._id)
      .populate('author', 'name avatar year')
      .populate('answers.author', 'name avatar year')
      .populate('answers.comments.author', 'name avatar');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to upvote answer.' });
  }
});

// POST /api/doubts/:id/answers/:answerId/comment - Add comment to answer
router.post('/:id/answers/:answerId/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found.' });

    const answer = doubt.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found.' });

    answer.comments.push({
      author: req.user._id,
      text: text.trim()
    });

    await doubt.save();

    const updated = await Doubt.findById(doubt._id)
      .populate('author', 'name avatar year')
      .populate('answers.author', 'name avatar year')
      .populate('answers.comments.author', 'name avatar');

    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment.' });
  }
});

export default router;
