import express from 'express';
import { Quiz, QuizAttempt } from '../models/Quiz.js';
import { User } from '../models/User.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/quiz - List all quizzes
router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('-questions.correctOptionIndex -questions.explanation');
    const attempts = await QuizAttempt.find({ user: req.user._id });
    const attemptedQuizIds = new Set(attempts.filter(a => a.passed).map(a => a.quiz.toString()));

    const result = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      category: q.category,
      description: q.description,
      timeLimitMinutes: q.timeLimitMinutes,
      totalQuestions: q.questions.length,
      creditReward: q.creditReward,
      isPassed: attemptedQuizIds.has(q._id.toString())
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes.' });
  }
});

// GET /api/quiz/:id - Get specific quiz with questions (without exposing correct answers)
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    const safeQuestions = quiz.questions.map((q, idx) => ({
      index: idx,
      questionText: q.questionText,
      options: q.options
    }));

    res.json({
      _id: quiz._id,
      title: quiz.title,
      category: quiz.category,
      description: quiz.description,
      creditReward: quiz.creditReward,
      questions: safeQuestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load quiz questions.' });
  }
});

// POST /api/quiz/:id/submit - Submit answers and calculate score & credits
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body; // array of numbers: selected option index for each question
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    let score = 0;
    const total = quiz.questions.length;
    const answerBreakdown = [];

    quiz.questions.forEach((q, idx) => {
      const userSelected = answers ? answers[idx] : null;
      const isCorrect = userSelected === q.correctOptionIndex;
      if (isCorrect) score += 1;

      answerBreakdown.push({
        questionIndex: idx,
        questionText: q.questionText,
        userAnswer: userSelected !== null && userSelected !== undefined ? q.options[userSelected] : 'No answer',
        correctAnswer: q.options[q.correctOptionIndex],
        isCorrect,
        explanation: q.explanation
      });
    });

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= quiz.passingPercentage;
    let creditsEarned = 0;

    // Check if user already passed this quiz before (prevent double credit claiming)
    const existingPassed = await QuizAttempt.findOne({ user: req.user._id, quiz: quiz._id, passed: true });

    if (passed && !existingPassed) {
      creditsEarned = quiz.creditReward;
      const user = await User.findById(req.user._id);
      user.credits += creditsEarned;
      await user.save();

      await CreditTransaction.create({
        user: user._id,
        amount: creditsEarned,
        type: 'quiz_reward',
        description: `Passed Quiz: "${quiz.title}" with score ${percentage}%`,
        balanceAfter: user.credits
      });
    }

    await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      score,
      totalQuestions: total,
      passed,
      creditsEarned
    });

    res.json({
      score,
      totalQuestions: total,
      percentage,
      passed,
      creditsEarned,
      breakdown: answerBreakdown,
      alreadyClaimed: !!existingPassed
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit quiz.' });
  }
});

export default router;
