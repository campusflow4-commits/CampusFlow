import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'skillswap_default_secret_2026', {
    expiresIn: '30d'
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database is currently connecting or unavailable. Please ensure MongoDB Atlas Network Access has 0.0.0.0/0 allowed and the cluster is active.'
      });
    }

    const { name, email, year, password, confirmPassword, college, referralCodeInput, deviceId } = req.body;

    if (!name || !email || !year || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only Gmail addresses (@gmail.com) are accepted on CampusFlow.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this Gmail address already exists.' });
    }

    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code for this student
    const generatedReferral = 'SKILL-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Check if referred by another student
    let referrerUser = null;
    let initialCredits = 50; // Starter credits

    if (referralCodeInput) {
      referrerUser = await User.findOne({ referralCode: referralCodeInput.trim().toUpperCase() });
      if (referrerUser) {
        initialCredits += 20; // Bonus for using referral
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      year,
      college: college || 'Engineering & Technology Institute',
      referralCode: generatedReferral,
      referredBy: referrerUser ? referrerUser.referralCode : null,
      credits: initialCredits,
      activeDeviceId: deviceId || 'device_' + Math.random().toString(36).substring(2, 9),
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7-day trial
    });

    // Record starter credit transaction
    await CreditTransaction.create({
      user: user._id,
      amount: initialCredits,
      type: 'WELCOME_BONUS',
      description: referrerUser ? 'Welcome bonus + Referral invite bonus' : 'New student starter credits',
      balanceAfter: initialCredits
    });

    // Award bonus to referrer if applicable
    if (referrerUser) {
      referrerUser.credits += 20;
      referrerUser.referralCount += 1;
      await referrerUser.save();

      await CreditTransaction.create({
        user: referrerUser._id,
        amount: 20,
        type: 'REFERRAL_REWARD',
        description: `Referral reward for inviting student ${user.name}`,
        balanceAfter: referrerUser.credits
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      year: user.year,
      college: user.college,
      bio: user.bio,
      avatar: user.avatar,
      credits: user.credits,
      rating: user.rating,
      skillsToTeach: user.skillsToTeach,
      skillsToLearn: user.skillsToLearn,
      currentStreak: user.currentStreak,
      referralCode: user.referralCode,
      trialEndDate: user.trialEndDate,
      token
    });
  } catch (error) {
    const rawMsg = error.message || '';
    let clientMsg = rawMsg;
    if (
      rawMsg.includes('SSL routines') ||
      rawMsg.includes('SSL alert number 80') ||
      rawMsg.includes('tlsv1 alert internal error') ||
      rawMsg.includes('MongooseServerSelectionError')
    ) {
      clientMsg = 'Database connection failed: MongoDB Atlas rejected the SSL/TLS connection. Please ensure your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access and the cluster is active.';
    }
    res.status(500).json({ message: clientMsg || 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database is currently connecting or unavailable. Please ensure MongoDB Atlas Network Access has 0.0.0.0/0 allowed and the cluster is active.'
      });
    }

    const { email, password, deviceId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both your Gmail and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Gmail address or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Gmail address or password.' });
    }

    // Feature 26: Set active device ID upon login
    const currentDeviceId = deviceId || 'device_' + Math.random().toString(36).substring(2, 9);
    user.activeDeviceId = currentDeviceId;
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      year: user.year,
      college: user.college,
      bio: user.bio,
      avatar: user.avatar,
      credits: user.credits,
      rating: user.rating,
      skillsToTeach: user.skillsToTeach,
      skillsToLearn: user.skillsToLearn,
      currentStreak: user.currentStreak,
      referralCode: user.referralCode,
      trialEndDate: user.trialEndDate,
      activeDeviceId: currentDeviceId,
      token
    });
  } catch (error) {
    const rawMsg = error.message || '';
    let clientMsg = rawMsg;
    if (
      rawMsg.includes('SSL routines') ||
      rawMsg.includes('SSL alert number 80') ||
      rawMsg.includes('tlsv1 alert internal error') ||
      rawMsg.includes('MongooseServerSelectionError')
    ) {
      clientMsg = 'Database connection failed: MongoDB Atlas rejected the SSL/TLS connection. Please ensure your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access and the cluster is active.';
    }
    res.status(500).json({ message: clientMsg || 'Server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', protect, async (req, res) => {
  try {
    req.user.activeDeviceId = null;
    await req.user.save();
    res.json({ message: 'Logged out successfully. Device session released.' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = req.user;
  
  // Calculate remaining trial days
  const now = new Date();
  const trialEnd = new Date(user.trialEndDate);
  const diffTime = trialEnd - now;
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    year: user.year,
    college: user.college,
    bio: user.bio,
    avatar: user.avatar,
    credits: user.credits,
    rating: user.rating,
    totalRatings: user.totalRatings,
    skillsToTeach: user.skillsToTeach,
    skillsToLearn: user.skillsToLearn,
    currentStreak: user.currentStreak,
    referralCode: user.referralCode,
    referralCount: user.referralCount,
    trialEndDate: user.trialEndDate,
    trialDaysRemaining: daysLeft,
    watchedVideosCount: user.watchedVideosCount,
    reward5VideosClaimed: user.reward5VideosClaimed,
    experience: user.experience || [],
    projects: user.projects || [],
    fontPreference: user.fontPreference,
    dashboardPreferences: user.dashboardPreferences
  });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, year, college, bio, avatar, skillsToTeach, skillsToLearn, experience, projects, fontPreference, dashboardPreferences } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (year) user.year = year;
    if (college) user.college = college;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (Array.isArray(skillsToTeach)) user.skillsToTeach = skillsToTeach;
    if (Array.isArray(skillsToLearn)) user.skillsToLearn = skillsToLearn;
    if (Array.isArray(experience)) user.experience = experience;
    if (Array.isArray(projects)) user.projects = projects;
    if (fontPreference) user.fontPreference = fontPreference;
    if (dashboardPreferences) user.dashboardPreferences = dashboardPreferences;

    await user.save();
    res.json({ message: 'Profile updated successfully!', user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update profile.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both your current and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    // Must fetch with password
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password.' });
  }
});

export default router;
