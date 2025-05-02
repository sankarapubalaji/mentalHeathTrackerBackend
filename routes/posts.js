import express from 'express';
import Post from '../models/Post.js';
import auth, { isPsychiatrist } from '../middleware/auth.js';

const router = express.Router();

// Create Post
router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      user: req.user.id,
      content: req.body.content,
    });
    await post.save();
    await post.populate('user', 'fullName');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'fullName')
      .populate('comments.user', 'fullName')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user.id, content: req.body.content });
    await post.save();
    await post.populate('user', 'fullName');
    await post.populate('comments.user', 'fullName');
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Recommendation (Psychiatrist only)
router.post('/:id/recommendation', auth, isPsychiatrist, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.recommendation = req.body.recommendation;
    await post.save();
    await post.populate('user', 'fullName');
    await post.populate('comments.user', 'fullName');
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;