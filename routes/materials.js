import express from 'express';
import Material from '../models/Material.js';

const router = express.Router();

// Submit Material (No auth)
router.post('/', async (req, res) => {
  try {
    const { userId, title, type, url } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const material = new Material({
      user: userId,
      title,
      type,
      url,
    });
    await material.save();
    await material.populate('user', 'fullName');
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Materials (No auth)
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve Material (No isPsychiatrist auth, but still requires userId)
router.put('/:id/approve', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

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