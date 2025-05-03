import express from 'express';
import Session from '../models/Session.js';
import auth, { isPsychiatrist } from '../middleware/auth.js';

const router = express.Router();

// Create Session (Psychiatrist only)
router.post('/', auth, isPsychiatrist, async (req, res) => {
  try {
    const { title, date, description, link } = req.body;
    if (!title || !date || !description || !link) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const session = new Session({
      title,
      date,
      description,
      link,
      psychiatrist: req.user.id,
    });
    await session.save();
    await session.populate('psychiatrist', 'fullName');
    res.status(201).json(session);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Sessions
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('psychiatrist', 'fullName')
      .populate('participants', 'fullName')
      .populate('feedback.user', 'fullName')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join Session
router.post('/:id/join', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already joined' });
    }

    session.participants.push(req.user.id);
    await session.save();
    await session.populate('psychiatrist', 'fullName');
    await session.populate('participants', 'fullName');
    await session.populate('feedback.user', 'fullName');
    res.json({ message: 'Joined successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Feedback content is required' });

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.feedback.push({ user: req.user.id, content });
    await session.save();
    await session.populate('psychiatrist', 'fullName');
    await session.populate('participants', 'fullName');
    await session.populate('feedback.user', 'fullName');
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;