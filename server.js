import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import materialRoutes from './routes/materials.js';
import psychiatristRoutes from './routes/psychiatrists.js';
import sessionRoutes from './routes/sessions.js';
import User from './models/User.js';
import Psychiatrist from './models/Psychiatrist.js';

dotenv.config();
dotenv.config();
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/psychiatrists', psychiatristRoutes);
app.use('/api/sessions', sessionRoutes);

// Populate Psychiatrist collection on user registration (if psychiatrist)
app.use('/api/users', async (req, res, next) => {
  if (req.method === 'POST' && req.url === '/register') {
    const { isPsychiatrist, fullName, specialization, contact } = req.body;
    if (isPsychiatrist) {
      try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          const psychiatrist = new Psychiatrist({
            user: user._id,
            name: fullName,
            specialization,
            contact,
          });
          await psychiatrist.save();
        }
      } catch (error) {
        console.error('Error creating psychiatrist entry:', error);
      }
    }
  }
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));