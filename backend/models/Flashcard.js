import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  // Spaced Repetition Algorithm (SM-2) fields
  nextReviewDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  interval: {
    type: Number,
    default: 1 // Days until next review
  },
  repetitions: {
    type: Number,
    default: 0
  },
  easeFactor: {
    type: Number,
    default: 2.5
  },
  lastReviewDate: {
    type: Date
  },
  // Statistics
  totalReviews: {
    type: Number,
    default: 0
  },
  correctReviews: {
    type: Number,
    default: 0
  },
  incorrectReviews: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to update card based on SM-2 algorithm
flashcardSchema.methods.updateSpacedRepetition = function(quality) {
  // quality: 0-5 (0 = total blackout, 5 = perfect response)
  const reviewedAt = new Date();

  this.totalReviews += 1;
  this.lastReviewDate = reviewedAt;

  if (quality >= 3) {
    this.correctReviews += 1;

    if (this.repetitions === 0) {
      this.interval = quality >= 5 ? 3 : 1;
    } else if (this.repetitions === 1) {
      this.interval = quality >= 5 ? 8 : 6;
    } else {
      const growthFactor = quality >= 5 ? this.easeFactor + 0.15 : this.easeFactor;
      this.interval = Math.max(1, Math.round(this.interval * growthFactor));
    }

    this.repetitions += 1;

    // Successful reviews move the card out by whole-day intervals.
    this.nextReviewDate = new Date(reviewedAt.getTime() + this.interval * 24 * 60 * 60 * 1000);
  } else {
    this.incorrectReviews += 1;
    this.repetitions = 0;
    this.interval = 0;

    // Failed cards should reappear soon instead of disappearing for a full day.
    this.nextReviewDate = new Date(reviewedAt.getTime() + 10 * 60 * 1000);
  }

  // Update ease factor
  this.easeFactor = this.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (this.easeFactor < 1.3) {
    this.easeFactor = 1.3;
  }
};

// Static method to get due cards
flashcardSchema.statics.getDueCards = function(userId, subjectId = null) {
  const query = {
    userId,
    nextReviewDate: { $lte: new Date() }
  };
  
  if (subjectId) {
    query.subjectId = subjectId;
  }

  return this.find(query)
    .populate('subjectId', 'name color')
    .sort({ nextReviewDate: 1, createdAt: 1 });
};

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;
