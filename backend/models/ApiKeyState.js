import mongoose from 'mongoose';

const apiKeyStateSchema = new mongoose.Schema({
  service:      { type: String, required: true, unique: true }, // e.g. "gemini"
  currentIndex: { type: Number, default: 0 },
  lastUpdated:  { type: Date,   default: Date.now }
});

export default mongoose.model('ApiKeyState', apiKeyStateSchema);
