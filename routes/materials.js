import express from 'express';
import Material from '../models/Material.js';
import auth, { isPsychiatrist } from '../middleware/auth.js';

const router = express.Router();

// Submit Material
router.post('/', auth, async (req, res) => {
  try {
    const material = new Material({
      user: req.user.id,
      title: req.body.title,
      type: req.body.type,
      url: req.body.url,
    });
    await material.save();
    await material.populate('user', 'fullName');
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Materials
router.get('/', auth, async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve Material (Psychiatrist only)
router.put('/:id/approve', auth, isPsychiatrist, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    material.isApproved = true;
    await material.save();
    await material.populate('user', 'fullName');
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;