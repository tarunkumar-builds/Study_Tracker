import mongoose from 'mongoose';

const historySubjectSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  minutes: {
    type: Number,
    default: 0
  },
  sessions: {
    type: Number,
    default: 0
  }
}, { _id: false });

const studyHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  totalFocusMinutes: {
    type: Number,
    default: 0
  },
  sessionCount: {
    type: Number,
    default: 0
  },
  subjects: [historySubjectSchema]
}, { timestamps: true });

// One history document per user per date.
studyHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

const StudyHistory = mongoose.model('StudyHistory', studyHistorySchema);

export default StudyHistory;

