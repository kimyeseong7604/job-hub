import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    bookmarkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookmark'
    },
    type: {
      type: String,
      enum: ['DEADLINE', 'INTERVIEW', 'CODING_TEST', 'ETC'],
      required: true
    },
    eventDate: {
      type: Date,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Schedule', scheduleSchema);
