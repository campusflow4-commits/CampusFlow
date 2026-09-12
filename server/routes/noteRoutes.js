import express from 'express';
import { Note } from '../models/Note.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notes - List user's notes with optional search & category filter
router.get('/', protect, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { content: regex }, { tags: regex }];
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes.' });
  }
});

// POST /api/notes - Create new note
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, tags, color } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const note = await Note.create({
      user: req.user._id,
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      color: color || '#6366f1'
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note.' });
  }
});

// PUT /api/notes/:id - Update note
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    const { title, content, category, tags, color } = req.body;
    if (title) note.title = title.trim();
    if (content) note.content = content.trim();
    if (category) note.category = category;
    if (tags !== undefined) note.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (color) note.color = color;

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note.' });
  }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note.' });
  }
});

export default router;
