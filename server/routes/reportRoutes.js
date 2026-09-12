import express from 'express';
import { Report } from '../models/Report.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/reports/my-reports - View submitted complaints
router.get('/my-reports', protect, async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('reportedUser', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports.' });
  }
});

// POST /api/reports/submit - Submit a complaint/report
router.post('/submit', protect, async (req, res) => {
  try {
    const { reportedUserId, category, description, relatedContent } = req.body;

    if (!category || !description) {
      return res.status(400).json({ message: 'Please select a category and provide a description.' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId || null,
      category,
      description: description.trim(),
      relatedContent: relatedContent || '',
      status: 'Pending'
    });

    res.status(201).json({
      message: 'Your report has been submitted confidentially. Our moderation team will review it.',
      report
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report.' });
  }
});

export default router;
