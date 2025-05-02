import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPsychiatrist: { type: Boolean, default: false },
  specialization: { type: String },
  contact: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);