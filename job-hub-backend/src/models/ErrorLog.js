import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  errorType: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ErrorLog', errorLogSchema);
