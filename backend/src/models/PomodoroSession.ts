import mongoose, { Document, Schema } from 'mongoose';

export interface IPomodoroSession extends Document {
  userId: mongoose.Types.ObjectId;
  duration: number; // in minutes (25, 15, 5)
  type: 'work' | 'short-break' | 'long-break';
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PomodoroSessionSchema = new Schema<IPomodoroSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    enum: [25, 15, 5], // 25min work, 15min long break, 5min short break
    default: 25
  },
  type: {
    type: String,
    enum: ['work', 'short-break', 'long-break'],
    required: [true, 'Session type is required'],
    default: 'work'
  },
  completed: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
PomodoroSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPomodoroSession>('PomodoroSession', PomodoroSessionSchema);
