import mongoose from 'mongoose';

const pomodoroSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    index: true
  },
  duration: {
    type: Number,
    required: true // Duration in minutes
  },
  type: {
    type: String,
    enum: ['focus', 'break'],
    default: 'focus'
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for analytics queries
pomodoroSessionSchema.index({ userId: 1, date: -1 });
pomodoroSessionSchema.index({ userId: 1, subjectId: 1, date: -1 });

// Static method to get daily stats
pomodoroSessionSchema.statics.getDailyStats = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const sessions = await this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
    completed: true
  }).populate('subjectId', 'name color');
  
  const totalMinutes = sessions.reduce((sum, session) => {
    return session.type === 'focus' ? sum + session.duration : sum;
  }, 0);
  
  const subjectBreakdown = {};
  sessions.forEach(session => {
    if (session.type === 'focus' && session.subjectId) {
      const subjectName = session.subjectId.name;
      if (!subjectBreakdown[subjectName]) {
        subjectBreakdown[subjectName] = {
          name: subjectName,
          color: session.subjectId.color,
          minutes: 0
        };
      }
      subjectBreakdown[subjectName].minutes += session.duration;
    }
  });
  
  return {
    totalMinutes,
    sessionCount: sessions.filter(s => s.type === 'focus').length,
    subjectBreakdown: Object.values(subjectBreakdown)
  };
};

// Static method to get weekly stats
pomodoroSessionSchema.statics.getWeeklyStats = async function(userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const sessions = await this.find({
    userId,
    date: { $gte: startDate, $lt: endDate },
    completed: true,
    type: 'focus'
  }).populate('subjectId', 'name color');
  
  const dailyData = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const daySessions = sessions.filter(s => {
      return s.date >= dayStart && s.date <= dayEnd;
    });
    
    const minutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
    
    dailyData.push({
      date: currentDate.toISOString().split('T')[0],
      minutes,
      sessionCount: daySessions.length
    });
  }
  
  return dailyData;
};

// Static method to get day-by-day stats in a date range
pomodoroSessionSchema.statics.getRangeStats = async function(userId, startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const sessions = await this.find({
    userId,
    completed: true,
    type: 'focus',
    date: { $gte: start, $lte: end }
  }).select('date duration');

  const dayMap = {};
  sessions.forEach((session) => {
    const dayKey = new Date(session.date).toISOString().split('T')[0];
    if (!dayMap[dayKey]) {
      dayMap[dayKey] = { date: dayKey, minutes: 0, sessionCount: 0 };
    }
    dayMap[dayKey].minutes += session.duration;
    dayMap[dayKey].sessionCount += 1;
  });

  const data = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().split('T')[0];
    data.push(dayMap[key] || { date: key, minutes: 0, sessionCount: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return data;
};

const PomodoroSession = mongoose.model('PomodoroSession', pomodoroSessionSchema);

export default PomodoroSession;
