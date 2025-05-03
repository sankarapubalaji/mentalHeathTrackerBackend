import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendVerificationEmail, sendConsultationEmail } from '../config/nodemailer.js';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js';
import Session from '../models/Session.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { fullName, email, password, isPsychiatrist, specialization, contact } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.random().toString(36).substring(2);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      isPsychiatrist,
      specialization: isPsychiatrist ? specialization : undefined,
      contact: isPsychiatrist ? contact : undefined,
      verificationToken,
    });

    await user.save();
    await sendVerificationEmail(email, fullName, verificationToken);
    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, isPsychiatrist: user.isPsychiatrist },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Email
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const postCount = await Post.countDocuments({ user: userId });
    const sessionCount = await Session.countDocuments({
      $or: [{ participants: userId }, { psychiatrist: userId }],
    });

    const stats = {
      posts: postCount,
      sessions: sessionCount,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/public-users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send Consultation Request
router.post('/send-consultation', async (req, res) => {
  const { patientEmail, patientName, doctorName, contact, email, concern, timing } = req.body;
  if (!patientEmail) {
    return res.status(400).json({ message: 'Patient email is required' });
  }
  try {
    await sendConsultationEmail(patientEmail, patientName, doctorName, contact, email, concern, timing);
    res.status(200).json({ message: 'Consultation request sent successfully' });
  } catch (error) {
    console.error('Error sending consultation request:', error);
    res.status(500).json({ message: 'Failed to send consultation request' });
  }
});

export default router;