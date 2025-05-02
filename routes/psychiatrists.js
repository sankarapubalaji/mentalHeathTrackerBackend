import express from 'express';
import User from '../models/User.js';
import Psychiatrist from '../models/Psychiatrist.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get All Psychiatrists
router.get('/', auth, async (req, res) => {
  try {
    const psychiatrists = await Psychiatrist.find();
    res.json(psychiatrists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Connect with Psychiatrist
router.post('/:id/connect', auth, async (req, res) => {
  try {
    const psychiatrist = await Psychiatrist.findById(req.params.id);
    if (!psychiatrist) return res.status(404).json({ message: 'Psychiatrist not found' });

    // Here you can implement logic to handle connection requests (e.g., notifications)
    res.json({ message: 'Connection request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;