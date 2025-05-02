import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendVerificationEmail from '../config/nodemailer.js';
import auth from '../middleware/auth.js';

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
      console.error('Registration error:', error); // Log the error
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

export default router;