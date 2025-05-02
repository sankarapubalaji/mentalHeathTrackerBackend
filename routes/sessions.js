import express from 'express';
import Session from '../models/Session.js';
import auth, { isPsychiatrist } from '../middleware/auth.js';

const router = express.Router();

// Create Session (Psychiatrist only)
router.post('/', auth, isPsychiatrist, async (req, res) => {
  try {
    const session = new Session({
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      psychiatrist: req.user.id,
    });
    await session.save();
    await session.populate('psychiatrist', 'fullName');
    res.status(201).json(session);
  } catch (error) {
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
    res.json({ message: 'Joined successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.feedback.push({ user: req.user.id, content: req.body.content });
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