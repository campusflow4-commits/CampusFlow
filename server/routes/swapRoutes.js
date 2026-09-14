import express from 'express';
import { User } from '../models/User.js';
import { Skill } from '../models/Skill.js';
import { SwapRequest } from '../models/SwapRequest.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/swaps/explore - Browse all available skills from peers
router.get('/explore', protect, async (req, res) => {
  try {
    const { search, category, year, minRating } = req.query;

    // Exclude the logged-in user so they only browse other students
    let userQuery = { _id: { $ne: req.user._id } };

    if (year && year !== 'All') {
      userQuery.year = year;
    }
    if (minRating) {
      userQuery.rating = { $gte: parseFloat(minRating) };
    }

    let students = await User.find(userQuery).select('-password');

    // Filter by skill search if provided
    if (search) {
      const regex = new RegExp(search, 'i');
      students = students.filter(s => 
        s.name.match(regex) ||
        s.skillsToTeach.some(sk => sk.match(regex)) ||
        s.skillsToLearn.some(sk => sk.match(regex))
      );
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills directory.' });
  }
});

// GET /api/swaps/matches - Intelligent Skill Matching Engine
router.get('/matches', protect, async (req, res) => {
  try {
    const currentUser = req.user;
    const myTeach = (currentUser.skillsToTeach || []).map(s => s.toLowerCase().trim());
    const myLearn = (currentUser.skillsToLearn || []).map(s => s.toLowerCase().trim());

    if (myTeach.length === 0 && myLearn.length === 0) {
      return res.json({
        message: 'Add skills you can teach and skills you want to learn to get smart matches!',
        matches: []
      });
    }

    // Find other students
    const candidateUsers = await User.find({ _id: { $ne: currentUser._id } }).select('-password');

    const matches = candidateUsers.map(candidate => {
      const candidateTeach = (candidate.skillsToTeach || []).map(s => s.toLowerCase().trim());
      const candidateLearn = (candidate.skillsToLearn || []).map(s => s.toLowerCase().trim());

      // 1. Mutual direct match: Candidate teaches what I want, AND wants what I teach!
      const theyTeachWhatIWant = candidateTeach.filter(skill => myLearn.includes(skill));
      const iTeachWhatTheyWant = myTeach.filter(skill => candidateLearn.includes(skill));

      // Calculate matching score (0 to 100%)
      let score = 50; // base score
      let reasons = [];

      if (theyTeachWhatIWant.length > 0 && iTeachWhatTheyWant.length > 0) {
        score = 90 + Math.min(8, (theyTeachWhatIWant.length + iTeachWhatTheyWant.length) * 2);
        reasons.push(`Perfect Match: ${candidate.name} teaches ${theyTeachWhatIWant.join(', ')} (which you want), and wants to learn ${iTeachWhatTheyWant.join(', ')} (which you teach)!`);
      } else if (theyTeachWhatIWant.length > 0) {
        score = 75 + Math.min(10, theyTeachWhatIWant.length * 5);
        reasons.push(`${candidate.name} teaches ${theyTeachWhatIWant.join(', ')} which matches your learning goals.`);
      } else if (iTeachWhatTheyWant.length > 0) {
        score = 70 + Math.min(10, iTeachWhatTheyWant.length * 5);
        reasons.push(`${candidate.name} is eager to learn ${iTeachWhatTheyWant.join(', ')} which you are skilled in.`);
      } else {
        // Fallback similarity match
        score = 55;
        reasons.push(`Student in ${candidate.year} with strong ${candidate.rating}★ community rating.`);
      }

      // Bonus for high rating
      if (candidate.rating >= 4.5) {
        score = Math.min(99, score + 4);
      }

      // Proximity bonus if in same year
      if (candidate.year === currentUser.year) {
        score = Math.min(99, score + 3);
        reasons.push(`Same academic year (${candidate.year}) - ideal pace for study sessions.`);
      }

      return {
        student: candidate,
        matchScore: Math.round(score),
        reasons,
        mutualSkills: {
          theyTeach: theyTeachWhatIWant,
          youTeach: iTeachWhatTheyWant
        }
      };
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      matches: matches.slice(0, 15) // Top 15 best matches
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating skill matches.' });
  }
});

// POST /api/swaps/request - Send a swap proposal
router.post('/request', protect, async (req, res) => {
  try {
    const { receiverId, skillOffered, skillRequested, message } = req.body;

    if (!receiverId || !skillOffered || !skillRequested) {
      return res.status(400).json({ message: 'Please specify the student, skill you offer, and skill you want.' });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot swap skills with yourself.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Requested student not found.' });
    }

    // Check if sender has at least minimum credits (15 credits per swap commitment)
    if (req.user.credits < 15) {
      return res.status(400).json({
        message: 'Insufficient credits. You need at least 15 credits to initiate a skill swap. Teach skills, watch learning videos, or take quizzes to earn credits!'
      });
    }

    // Check for duplicate pending requests between these two
    const existing = await SwapRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending swap proposal with this student.' });
    }

    const swap = await SwapRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      skillOffered,
      skillRequested,
      message: message || 'Hi! Looking forward to swapping skills with you.',
      creditCost: 15,
      status: 'pending'
    });

    // Deduct 15 credits for initiating the swap commitment
    req.user.credits -= 15;
    await req.user.save();
    await CreditTransaction.create({
      user: req.user._id,
      amount: -15,
      type: 'LEARNING_COST',
      description: `Skill Swap Request initiated with ${receiver.name} for ${skillRequested}`,
      balanceAfter: req.user.credits
    });

    const populated = await SwapRequest.findById(swap._id)
      .populate('sender', 'name email avatar year rating')
      .populate('receiver', 'name email avatar year rating');

    res.status(201).json({ message: 'Skill swap request sent successfully!', swap: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to send swap request.' });
  }
});

// GET /api/swaps/my-requests - Get incoming and outgoing swap requests
router.get('/my-requests', protect, async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ receiver: req.user._id })
      .populate('sender', 'name email avatar year rating college')
      .sort({ createdAt: -1 });

    const outgoing = await SwapRequest.find({ sender: req.user._id })
      .populate('receiver', 'name email avatar year rating college')
      .sort({ createdAt: -1 });

    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch swap requests.' });
  }
});

// PUT /api/swaps/:id/accept - Accept a swap request
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found.' });

    if (swap.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request.' });
    }

    swap.status = 'accepted';
    await swap.save();

    res.json({ message: 'Swap request accepted! You can now coordinate via chat.', swap });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept swap request.' });
  }
});

// PUT /api/swaps/:id/reject - Reject a swap request
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found.' });

    if (swap.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    swap.status = 'rejected';
    await swap.save();

    // Refund credits to sender
    const sender = await User.findById(swap.sender);
    if (sender) {
      sender.credits += 15;
      await sender.save();
      await CreditTransaction.create({
        user: sender._id,
        amount: 15,
        type: 'SWAP_COMPLETION', // or admin_adjustment/refund, but let's stick to standard types or just SWAP_COMPLETION
        description: `Refund: Swap request declined by ${req.user.name}`,
        balanceAfter: sender.credits
      });
    }

    res.json({ message: 'Swap request declined and credits refunded to sender.', swap });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject swap request.' });
  }
});

// PUT /api/swaps/:id/complete - Complete swap & safely transfer credits
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found.' });

    if (swap.sender.toString() !== req.user._id.toString() && swap.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (swap.status === 'completed') {
      return res.status(400).json({ message: 'This swap has already been completed.' });
    }

    // Mark completed
    swap.status = 'completed';
    swap.completedAt = new Date();
    await swap.save();

    // Reward credits for completed educational exchange (+10 credits to each active student!)
    const sender = await User.findById(swap.sender);
    const receiver = await User.findById(swap.receiver);

    if (sender) {
      sender.credits += 10;
      await sender.save();
      await CreditTransaction.create({
        user: sender._id,
        amount: 10,
        type: 'SWAP_COMPLETION',
        description: `Completed Skill Swap: ${swap.skillOffered} <-> ${swap.skillRequested}`,
        balanceAfter: sender.credits
      });
    }

    if (receiver) {
      receiver.credits += 10;
      await receiver.save();
      await CreditTransaction.create({
        user: receiver._id,
        amount: 10,
        type: 'SWAP_COMPLETION',
        description: `Completed Skill Swap: ${swap.skillRequested} <-> ${swap.skillOffered}`,
        balanceAfter: receiver.credits
      });
    }

    res.json({
      message: '🎉 Skill Swap successfully completed! Both students earned +10 credits.',
      swap
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete swap.' });
  }
});

// POST /api/swaps/:id/rate - Submit 1-5 star peer rating
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const ratingNum = parseInt(stars);

    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5 stars.' });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found.' });

    const isSender = swap.sender.toString() === req.user._id.toString();
    const isReceiver = swap.receiver.toString() === req.user._id.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: 'You are not a participant in this swap.' });
    }

    const targetUserId = isSender ? swap.receiver : swap.sender;
    const ratingKey = isSender ? 'ratingBySender' : 'ratingByReceiver';

    // Prevent duplicate rating
    if (swap[ratingKey] && swap[ratingKey].stars) {
      return res.status(400).json({ message: 'You have already submitted a rating for this swap session.' });
    }

    swap[ratingKey] = {
      stars: ratingNum,
      comment: comment || 'Great peer learning experience!',
      ratedAt: new Date()
    };
    await swap.save();

    // Recalculate target user's average rating
    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      const currentTotal = targetUser.rating * targetUser.totalRatings;
      targetUser.totalRatings += 1;
      targetUser.rating = parseFloat(((currentTotal + ratingNum) / targetUser.totalRatings).toFixed(1));
      
      // Bonus credits for receiving a 5-star review!
      if (ratingNum === 5) {
        targetUser.credits += 5;
        await CreditTransaction.create({
          user: targetUser._id,
          amount: 5,
          type: 'TEACHING_REWARD',
          description: `Bonus for receiving a 5★ rating on skill swap`,
          balanceAfter: targetUser.credits
        });
      }

      await targetUser.save();
    }

    res.json({ message: 'Rating submitted successfully! Thank you for supporting the community.', swap });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating.' });
  }
});

export default router;
