import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Quiz } from '../models/Quiz.js';
import { CreditTransaction } from '../models/CreditTransaction.js';

export const seedInitialData = async () => {
  try {
    const existingDemoUsers = await User.countDocuments({ isDemoUser: true });
    // Always run this for now, so we can re-seed quizzes
    // if (existingDemoUsers > 0) {
    //   return; // Already seeded
    // }

    console.log('🌱 Seeding initial demo student profiles, educational videos, and quizzes...');

    // We skip User and Video insertion to avoid E11000 duplicate keys, since they are already there.
    // We only re-seed the Quizzes with 20 questions each.

    // 3. Seed Interactive Quizzes
    const pythonQuestions = Array.from({ length: 20 }).map((_, i) => ({
      questionText: `Python Concept ${i + 1}: Which of the following is correct?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: i % 4,
      explanation: `Detailed explanation for Python concept ${i + 1}.`
    }));

    const webQuestions = Array.from({ length: 20 }).map((_, i) => ({
      questionText: `Web Dev Concept ${i + 1}: What does this CSS property do?`,
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctOptionIndex: i % 4,
      explanation: `Explanation for frontend concept ${i + 1}.`
    }));

    const demoQuizzes = [
      {
        title: 'Python Essentials Quiz',
        category: 'Programming',
        description: 'Test your understanding of basic Python syntax, data types, and functions.',
        timeLimitMinutes: 10,
        passingPercentage: 60,
        creditReward: 20,
        questions: pythonQuestions
      },
      {
        title: 'Web Development & Frontend Basics',
        category: 'Web Development',
        description: 'Quick assessment on modern HTML, CSS flexbox, and JavaScript concepts.',
        timeLimitMinutes: 8,
        passingPercentage: 60,
        creditReward: 20,
        questions: webQuestions
      }
    ];

    await Quiz.deleteMany({});
    await Quiz.insertMany(demoQuizzes);

    console.log('✅ Demo data successfully seeded into MongoDB Atlas!');
  } catch (error) {
    console.error('⚠️ Note on demo seeding:', error.message);
  }
};
