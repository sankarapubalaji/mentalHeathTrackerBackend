import mongoose from 'mongoose';

const psychiatristSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  contact: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Psychiatrist', psychiatristSchema);