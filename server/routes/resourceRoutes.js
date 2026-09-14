import express from 'express';
import { Resource } from '../models/Resource.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/resources
router.get('/', protect, async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('recommendedBy', 'name avatar college year')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resources.' });
  }
});

// POST /api/resources
router.post('/', protect, async (req, res) => {
  try {
    const { title, author, resourceType, description, link } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const resource = await Resource.create({
      title: title.trim(),
      author: author ? author.trim() : 'Unknown',
      resourceType: resourceType || 'Book',
      description: description.trim(),
      link: link ? link.trim() : '',
      recommendedBy: req.user._id,
      upvotes: []
    });

    const populatedResource = await resource.populate('recommendedBy', 'name avatar college year');
    res.status(201).json(populatedResource);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add resource.' });
  }
});

// PUT /api/resources/:id/upvote
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });

    const upvoteIndex = resource.upvotes.indexOf(req.user._id);
    if (upvoteIndex === -1) {
      resource.upvotes.push(req.user._id);
    } else {
      resource.upvotes.splice(upvoteIndex, 1);
    }

    await resource.save();
    const populatedResource = await resource.populate('recommendedBy', 'name avatar college year');
    res.json(populatedResource);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle upvote.' });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });

    // Only allow author to delete
    if (resource.recommendedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this resource.' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resource.' });
  }
});

export default router;
