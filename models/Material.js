import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['music', 'reading', 'video', 'meditation', 'podcast'], required: true },
  url: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Material', materialSchema);