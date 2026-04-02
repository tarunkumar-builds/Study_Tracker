import mongoose from 'mongoose';
import { recalculateSubjectProgress } from '../utils/progressUtils.js';

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  durationSpent: {
    type: Number,
    default: 0
  },
  lastStudied: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  topics: [topicSchema],
  completionPercentage: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  chapters: [chapterSchema],
  timerTimeSpent: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate completion percentage for chapters
chapterSchema.methods.updateCompletion = function() {
  const chapterTopics = this.topics.length;
  const completedCount = this.topics.filter((topic) => topic.completed).length;
  this.completionPercentage = chapterTopics ? Math.round((completedCount / chapterTopics) * 100) : 0;
  this.totalTimeSpent = this.topics.reduce((sum, topic) => {
    const topicTime = Number(topic.timeSpent ?? topic.durationSpent ?? 0);
    topic.timeSpent = topicTime;
    topic.durationSpent = topicTime;
    return sum + topicTime;
  }, 0);
};

// Calculate completion percentage for subject
subjectSchema.methods.updateCompletion = function() {
  recalculateSubjectProgress(this);
};

// Auto-update completion before saving
subjectSchema.pre('save', function(next) {
  // Keep legacy and latest names in sync for backward compatibility.
  this.chapters.forEach((chapter) => {
    chapter.name = chapter.title || chapter.name;
    chapter.title = chapter.title || chapter.name;
    chapter.topics.forEach((topic) => {
      topic.name = topic.title || topic.name;
      topic.title = topic.title || topic.name;
      const topicTime = Number(topic.timeSpent ?? topic.durationSpent ?? 0);
      topic.timeSpent = topicTime;
      topic.durationSpent = topicTime;
    });
  });
  this.updateCompletion();
  next();
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
