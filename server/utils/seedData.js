import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Quiz } from '../models/Quiz.js';
import { CreditTransaction } from '../models/CreditTransaction.js';

export const seedInitialData = async () => {
  try {
    const existingDemoUsers = await User.countDocuments({ isDemoUser: true });
    if (existingDemoUsers > 0) {
      return; // Already seeded
    }

    console.log('🌱 Seeding initial demo student profiles, educational videos, and quizzes...');

    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash('student123', salt);

    // 1. Seed Demo Students
    const demoStudents = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        password: demoPassword,
        year: '3rd Year',
        college: 'Dept. of Computer Science & Engineering',
        bio: 'Specializing in Python backend systems and algorithmic problem solving. Always eager to exchange skills!',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        skillsToTeach: ['Python', 'Django', 'Data Structures & Algorithms'],
        skillsToLearn: ['UI/UX Design', 'Figma', 'React'],
        credits: 95,
        rating: 4.9,
        totalRatings: 18,
        isDemoUser: true,
        referralCode: 'SKILL-AARAV1'
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        password: demoPassword,
        year: '2nd Year',
        college: 'Information Technology Institute',
        bio: 'UI/UX enthusiast and frontend learner. Love creating clean interfaces and micro-interactions.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        skillsToTeach: ['UI/UX Design', 'Figma', 'HTML/CSS Basics'],
        skillsToLearn: ['Python', 'Machine Learning Basics'],
        credits: 80,
        rating: 4.8,
        totalRatings: 12,
        isDemoUser: true,
        referralCode: 'SKILL-PRIYA2'
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@gmail.com',
        password: demoPassword,
        year: '4th Year',
        college: 'School of Electrical & Computing Sciences',
        bio: 'Final year student passionate about Full-stack JavaScript and cloud infrastructure.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        skillsToTeach: ['React', 'Node.js', 'MongoDB', 'Git & GitHub'],
        skillsToLearn: ['Public Speaking', 'Interview Prep', 'Docker'],
        credits: 110,
        rating: 5.0,
        totalRatings: 25,
        isDemoUser: true,
        referralCode: 'SKILL-ROHAN3'
      },
      {
        name: 'Sneha Iyer',
        email: 'sneha.iyer@gmail.com',
        password: demoPassword,
        year: '1st Year',
        college: 'Applied Mathematics & Computing',
        bio: 'Freshman with a strong foundation in Discrete Mathematics and Linear Algebra. Learning modern web development.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        skillsToTeach: ['Discrete Mathematics', 'Calculus', 'C++ Programming'],
        skillsToLearn: ['React', 'Web Development', 'Graphic Design'],
        credits: 65,
        rating: 4.7,
        totalRatings: 9,
        isDemoUser: true,
        referralCode: 'SKILL-SNEHA4'
      }
    ];

    const createdUsers = await User.insertMany(demoStudents);

    // Create initial credit ledger transactions for demo users
    for (const u of createdUsers) {
      await CreditTransaction.create({
        user: u._id,
        amount: u.credits,
        type: 'initial_bonus',
        description: 'Starter community credits balance',
        balanceAfter: u.credits
      });
    }

    // 2. Seed 6 Educational Videos (Ensures 5+ videos available for Milestone Reward!)
    const demoVideos = [
      {
        title: 'Mastering Git & GitHub for Student Collaboration',
        description: 'Learn branching, pull requests, resolving merge conflicts, and team workflows in under 15 minutes.',
        category: 'Programming',
        duration: '14 min',
        videoUrl: 'https://www.youtube-nocookie.com/embed/RGOj5yH7evk',
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=600&auto=format&fit=crop&q=80',
        creditReward: 10,
        order: 1
      },
      {
        title: 'Modern UI/UX Principles: Typography & Color Hierarchy',
        description: 'Practical visual design rules for student apps, presentations, and hackathon project interfaces.',
        category: 'UI/UX Design',
        duration: '11 min',
        videoUrl: 'https://www.youtube-nocookie.com/embed/74z_ZzVlAos',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
        creditReward: 10,
        order: 2
      },
      {
        title: 'Python for Beginners: From Zero to Data Structures',
        description: 'Understand lists, dictionaries, sets, and functions with clear analogies and live coding.',
        category: 'Programming',
        duration: '18 min',
        videoUrl: 'https://www.youtube-nocookie.com/embed/kqtD5dpn9C8',
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
        creditReward: 10,
        order: 3
      },
      {
        title: 'React Fundamentals: Components, Props, and State',
        description: 'How modern interactive frontend web apps think in reusable components and react to user events.',
        category: 'Web Development',
        duration: '16 min',
        videoUrl: 'https://www.youtube-nocookie.com/embed/SqcY0GlETPk',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
        creditReward: 10,
        order: 4
      },
      {
        title: 'Data Structures in Practice: Stacks, Queues, & HashMaps',
        description: 'Core concepts interviewers test and real-world software applications rely on every single day.',
        category: 'Data Structures',
        duration: '15 min',
        videoUrl: 'https://www.youtube-nocookie.com/embed/bum_1950tSU',
        thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc1552a420b?w=600&auto=format&fit=crop&q=80',
        creditReward: 10,
        order: 5
      },
      {
        title: 'Cracking Technical Interviews: Communication & Problem Solving',
        description: 'How to communicate your thought process out loud and ask the right clarifying questions.',
        category: 'Soft Skills & Career',
        duration: '12 min',
        videoUrl: 'https://www.youtube-nocookie.com/embed/1qw5ITr3k9E',
        thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&auto=format&fit=crop&q=80',
        creditReward: 10,
        order: 6
      }
    ];

    await Video.deleteMany({});
    await Video.insertMany(demoVideos);

    // 3. Seed Interactive Quizzes
    const demoQuizzes = [
      {
        title: 'Python Essentials Quiz',
        category: 'Programming',
        description: 'Test your understanding of basic Python syntax, data types, and functions.',
        timeLimitMinutes: 10,
        passingPercentage: 60,
        creditReward: 25,
        questions: [
          {
            questionText: 'Which of the following data types is immutable in Python?',
            options: ['List', 'Dictionary', 'Tuple', 'Set'],
            correctOptionIndex: 2,
            explanation: 'Tuples in Python cannot be changed after creation, making them immutable.'
          },
          {
            questionText: 'What is the correct syntax to define a function in Python?',
            options: ['function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():'],
            correctOptionIndex: 1,
            explanation: 'Python uses the "def" keyword to declare functions.'
          },
          {
            questionText: 'What does the len() function return for len([10, 20, 30, 40])?',
            options: ['3', '4', '5', '40'],
            correctOptionIndex: 1,
            explanation: 'len() counts the number of elements in the collection, which is 4.'
          },
          {
            questionText: 'How do you insert an element at the end of a list in Python?',
            options: ['list.add(val)', 'list.append(val)', 'list.push(val)', 'list.insertEnd(val)'],
            correctOptionIndex: 1,
            explanation: 'The append() method appends an item to the end of a list.'
          }
        ]
      },
      {
        title: 'Web Development & Frontend Basics',
        category: 'Web Development',
        description: 'Quick assessment on modern HTML, CSS flexbox, and JavaScript concepts.',
        timeLimitMinutes: 8,
        passingPercentage: 60,
        creditReward: 25,
        questions: [
          {
            questionText: 'Which CSS property is used to create a flex container?',
            options: ['flex: 1', 'display: flex', 'align-items: center', 'position: relative'],
            correctOptionIndex: 1,
            explanation: 'Setting "display: flex" enables flexbox formatting context.'
          },
          {
            questionText: 'What does the "use strict" directive do in JavaScript?',
            options: ['Loads external libraries', 'Enforces strict parsing and error handling', 'Enables TypeScript compilation', 'Compiles code to WebAssembly'],
            correctOptionIndex: 1,
            explanation: '"use strict" catches common coding mistakes and unsafe actions.'
          },
          {
            questionText: 'What is the purpose of the React useState hook?',
            options: ['To manage component state in functional components', 'To fetch data from backend APIs', 'To handle browser navigation', 'To optimize bundle size'],
            correctOptionIndex: 0,
            explanation: 'useState allows functional components to store and update local reactive state.'
          }
        ]
      }
    ];

    await Quiz.deleteMany({});
    await Quiz.insertMany(demoQuizzes);

    console.log('✅ Demo data successfully seeded into MongoDB Atlas!');
  } catch (error) {
    console.error('⚠️ Note on demo seeding:', error.message);
  }
};
