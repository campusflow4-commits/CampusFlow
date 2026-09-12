import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOptionIndex: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timeLimitMinutes: {
    type: Number,
    default: 10
  },
  passingPercentage: {
    type: Number,
    default: 60
  },
  creditReward: {
    type: Number,
    default: 25
  },
  questions: [questionSchema]
}, {
  timestamps: true
});

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  creditsEarned: {
    type: Number,
    default: 0
  },
  selectedAnswers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean
  }]
}, {
  timestamps: true
});

export const Quiz = mongoose.model('Quiz', quizSchema);
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
