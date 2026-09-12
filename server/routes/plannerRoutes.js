import express from 'express';
import { Todo, Deadline, Practical, Timetable } from '../models/Planner.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/planner/summary - Dashboard high-level productivity widgets
router.get('/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Upcoming deadlines (not completed, sorted by due date)
    const upcomingDeadlines = await Deadline.find({ user: userId, completed: false })
      .sort({ dueDate: 1 })
      .limit(4);

    // Pending practicals
    const pendingPracticals = await Practical.find({ user: userId, status: { $ne: 'verified' } })
      .sort({ date: 1 })
      .limit(4);

    // Top active todos
    const activeTodos = await Todo.find({ user: userId, completed: false })
      .sort({ createdAt: -1 })
      .limit(5);

    // Current day timetable
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayClasses = await Timetable.find({ user: userId, day: todayName }).sort({ startTime: 1 });

    res.json({
      deadlines: upcomingDeadlines,
      practicals: pendingPracticals,
      todos: activeTodos,
      todayClasses,
      todayName
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load planner summary.' });
  }
});

// --- TODOS ---
router.get('/todos', protect, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ completed: 1, createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch todos.' });
  }
});

router.post('/todos', protect, async (req, res) => {
  try {
    const { title, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Todo title is required.' });

    const todo = await Todo.create({
      user: req.user._id,
      title: title.trim(),
      priority: priority || 'medium',
      dueDate: dueDate || null
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create todo.' });
  }
});

router.put('/todos/:id', protect, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ message: 'Todo not found.' });

    if (req.body.completed !== undefined) todo.completed = req.body.completed;
    if (req.body.title) todo.title = req.body.title;
    if (req.body.priority) todo.priority = req.body.priority;

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todo.' });
  }
});

router.delete('/todos/:id', protect, async (req, res) => {
  try {
    await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Todo deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo.' });
  }
});

// --- DEADLINES ---
router.get('/deadlines', protect, async (req, res) => {
  try {
    const deadlines = await Deadline.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch deadlines.' });
  }
});

router.post('/deadlines', protect, async (req, res) => {
  try {
    const { title, subject, dueDate, priority } = req.body;
    if (!title || !subject || !dueDate) {
      return res.status(400).json({ message: 'Title, subject, and dueDate are required.' });
    }

    const deadline = await Deadline.create({
      user: req.user._id,
      title: title.trim(),
      subject: subject.trim(),
      dueDate,
      priority: priority || 'high'
    });
    res.status(201).json(deadline);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add deadline.' });
  }
});

router.put('/deadlines/:id', protect, async (req, res) => {
  try {
    const deadline = await Deadline.findOne({ _id: req.params.id, user: req.user._id });
    if (!deadline) return res.status(404).json({ message: 'Deadline not found.' });

    if (req.body.completed !== undefined) deadline.completed = req.body.completed;
    if (req.body.title) deadline.title = req.body.title;
    if (req.body.subject) deadline.subject = req.body.subject;
    if (req.body.dueDate) deadline.dueDate = req.body.dueDate;
    if (req.body.priority) deadline.priority = req.body.priority;

    await deadline.save();
    res.json(deadline);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update deadline.' });
  }
});

router.delete('/deadlines/:id', protect, async (req, res) => {
  try {
    await Deadline.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deadline deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete deadline.' });
  }
});

// --- PRACTICALS ---
router.get('/practicals', protect, async (req, res) => {
  try {
    const practicals = await Practical.find({ user: req.user._id }).sort({ date: 1 });
    res.json(practicals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch practicals.' });
  }
});

router.post('/practicals', protect, async (req, res) => {
  try {
    const { subject, title, date, status, notes } = req.body;
    if (!subject || !title) return res.status(400).json({ message: 'Subject and title are required.' });

    const practical = await Practical.create({
      user: req.user._id,
      subject: subject.trim(),
      title: title.trim(),
      date: date || new Date(),
      status: status || 'pending',
      notes: notes || ''
    });
    res.status(201).json(practical);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add practical.' });
  }
});

router.put('/practicals/:id', protect, async (req, res) => {
  try {
    const practical = await Practical.findOne({ _id: req.params.id, user: req.user._id });
    if (!practical) return res.status(404).json({ message: 'Practical not found.' });

    if (req.body.status) practical.status = req.body.status;
    if (req.body.notes !== undefined) practical.notes = req.body.notes;
    if (req.body.title) practical.title = req.body.title;

    await practical.save();
    res.json(practical);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update practical.' });
  }
});

router.delete('/practicals/:id', protect, async (req, res) => {
  try {
    await Practical.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Practical deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete practical.' });
  }
});

// --- TIMETABLE ---
router.get('/timetable', protect, async (req, res) => {
  try {
    const classes = await Timetable.find({ user: req.user._id });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch timetable.' });
  }
});

router.post('/timetable', protect, async (req, res) => {
  try {
    const { day, startTime, endTime, subject, room, color } = req.body;
    if (!day || !startTime || !endTime || !subject) {
      return res.status(400).json({ message: 'Day, times, and subject are required.' });
    }

    const item = await Timetable.create({
      user: req.user._id,
      day,
      startTime,
      endTime,
      subject: subject.trim(),
      room: room || 'Classroom / Lab',
      color: color || '#6366f1'
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add class.' });
  }
});

router.delete('/timetable/:id', protect, async (req, res) => {
  try {
    await Timetable.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Class removed from timetable.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete class.' });
  }
});

export default router;
