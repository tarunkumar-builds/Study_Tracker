import PomodoroSession from '../models/PomodoroSession.js';
import StudyHistory from '../models/StudyHistory.js';
import Subject from '../models/Subject.js';

const toDayBounds = (inputDate) => {
  const start = new Date(inputDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(inputDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const normalizeDay = (inputDate) => {
  const normalized = new Date(inputDate);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const toDateKey = (inputDate) => {
  const date = new Date(inputDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return new Date();
  const parts = dateString.split('-').map((value) => Number(value));
  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
    return new Date(dateString);
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
};

const applyFocusSessionToHistory = async ({ userId, subjectId, duration, date, direction, countSession = false }) => {
  const day = normalizeDay(date);
  let history = await StudyHistory.findOne({ userId, date: day });

  if (!history && direction < 0) return;

  if (!history) {
    history = await StudyHistory.create({
      userId,
      date: day,
      totalFocusMinutes: 0,
      sessionCount: 0,
      subjects: []
    });
  }

  history.totalFocusMinutes = Math.max(0, history.totalFocusMinutes + (duration * direction));
  if (countSession) {
    history.sessionCount = Math.max(0, history.sessionCount + direction);
  }

  if (subjectId) {
    const entry = history.subjects.find((item) => String(item.subjectId) === String(subjectId));

    if (entry) {
      entry.minutes = Math.max(0, entry.minutes + (duration * direction));
      if (countSession) {
        entry.sessions = Math.max(0, entry.sessions + direction);
      }
    } else if (direction > 0) {
      history.subjects.push({ subjectId, minutes: duration, sessions: countSession ? 1 : 0 });
    }

    history.subjects = history.subjects.filter((item) => item.minutes > 0 || item.sessions > 0);
  }

  if (history.totalFocusMinutes === 0 && history.sessionCount === 0 && history.subjects.length === 0) {
    await history.deleteOne();
    return;
  }

  await history.save();
};

const applyFocusSessionToSubject = async ({ userId, subjectId, duration, direction }) => {
  if (!subjectId) return;

  const subject = await Subject.findOne({ _id: subjectId, userId, isActive: true });
  if (!subject) return;

  subject.timerTimeSpent = Math.max(0, Number(subject.timerTimeSpent || 0) + (duration * direction));
  await subject.save();
};

const getTimelineFromHistory = async (userId, startDate, endDate) => {
  const start = normalizeDay(startDate);
  const end = normalizeDay(endDate);

  const rows = await StudyHistory.find({
    userId,
    date: { $gte: start, $lte: end }
  })
    .populate('subjects.subjectId', 'name color')
    .sort({ date: 1 });

  const map = {};
  rows.forEach((row) => {
    const key = toDateKey(row.date);
    map[key] = {
      date: key,
      minutes: row.totalFocusMinutes || 0,
      sessionCount: row.sessionCount || 0,
      subjectBreakdown: (row.subjects || []).map((subject) => ({
        subjectId: subject.subjectId?._id || null,
        name: subject.subjectId?.name || 'Subject',
        color: subject.subjectId?.color || '#3B82F6',
        minutes: subject.minutes || 0,
        sessions: subject.sessions || 0
      }))
    };
  });

  const timeline = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = toDateKey(cursor);
    timeline.push(map[key] || { date: key, minutes: 0, sessionCount: 0, subjectBreakdown: [] });
    cursor.setDate(cursor.getDate() + 1);
  }

  return timeline;
};

// @desc    Get all pomodoro sessions
// @route   GET /api/pomodoro
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const { startDate, endDate, subjectId } = req.query;
    const query = { userId: req.user._id };

    if (subjectId) query.subjectId = subjectId;
    if (startDate && endDate) {
      const { start } = toDayBounds(startDate);
      const endBounds = toDayBounds(endDate).end;
      query.date = { $gte: start, $lte: endBounds };
    }

    const sessions = await PomodoroSession.find(query)
      .populate('subjectId', 'name color')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message
    });
  }
};

// @desc    Create new pomodoro session
// @route   POST /api/pomodoro
// @access  Private
export const createSession = async (req, res) => {
  try {
    const { subjectId, duration, type, completed, startTime, endTime } = req.body;
    const parsedDuration = Number(duration);

    if (Number.isNaN(parsedDuration) || parsedDuration < 0 || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a non-negative number and start time is required'
      });
    }

    const session = await PomodoroSession.create({
      userId: req.user._id,
      subjectId: subjectId || null,
      duration: parsedDuration,
      type: type || 'focus',
      completed: completed !== undefined ? completed : true,
      date: startTime || new Date(),
      startTime,
      endTime: endTime || new Date()
    });

    // Every focus session contributes to study time/history, even if not fully completed.
    if (session.type === 'focus' && (session.duration > 0 || session.completed)) {
      if (session.duration > 0) {
        await applyFocusSessionToSubject({
          userId: req.user._id,
          subjectId: session.subjectId,
          duration: session.duration,
          direction: 1
        });
      }

      await applyFocusSessionToHistory({
        userId: req.user._id,
        subjectId: session.subjectId,
        duration: session.duration,
        date: session.date,
        direction: 1,
        countSession: Boolean(session.completed)
      });
    }

    const populatedSession = await PomodoroSession.findById(session._id)
      .populate('subjectId', 'name color');

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: populatedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating session',
      error: error.message
    });
  }
};

// @desc    Get daily stats
// @route   GET /api/pomodoro/stats/daily
// @access  Private
export const getDailyStats = async (req, res) => {
  try {
    const targetDate = req.query.date ? parseDateOnly(req.query.date) : new Date();
    const day = normalizeDay(targetDate);

    const history = await StudyHistory.findOne({
      userId: req.user._id,
      date: day
    }).populate('subjects.subjectId', 'name color');

    if (!history) {
      return res.status(200).json({
        success: true,
        data: {
          totalMinutes: 0,
          sessionCount: 0,
          subjectBreakdown: []
        }
      });
    }

    const subjectBreakdown = (history.subjects || []).map((item) => ({
      name: item.subjectId?.name || 'Subject',
      color: item.subjectId?.color || '#3B82F6',
      minutes: item.minutes,
      sessions: item.sessions
    }));

    res.status(200).json({
      success: true,
      data: {
        totalMinutes: history.totalFocusMinutes || 0,
        sessionCount: history.sessionCount || 0,
        subjectBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily stats',
      error: error.message
    });
  }
};

// @desc    Get weekly stats
// @route   GET /api/pomodoro/stats/weekly
// @access  Private
export const getWeeklyStats = async (req, res) => {
  try {
    const { startDate } = req.query;
    let weekStart;

    if (startDate) {
      weekStart = new Date(startDate);
    } else {
      weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    }
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const timeline = await getTimelineFromHistory(req.user._id, weekStart, weekEnd);
    const weekly = timeline.map((day) => ({
      date: day.date,
      minutes: day.minutes,
      sessionCount: day.sessionCount
    }));

    res.status(200).json({
      success: true,
      data: weekly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly stats',
      error: error.message
    });
  }
};

// @desc    Get date-range timeline stats
// @route   GET /api/sessions/range
// @access  Private
export const getRangeStats = async (req, res) => {
  try {
    const end = req.query.endDate ? parseDateOnly(req.query.endDate) : new Date();
    const start = req.query.startDate ? parseDateOnly(req.query.startDate) : new Date(end);
    if (!req.query.startDate) {
      start.setDate(end.getDate() - 6);
    }

    const timeline = await getTimelineFromHistory(req.user._id, start, end);
    const userPref = await Subject.findOne({ userId: req.user._id })
      .populate('userId', 'preferences')
      .select('userId');
    const dailyGoal = userPref?.userId?.preferences?.dailyGoalMinutes || 120;

    const timelineWithCompletion = timeline.map((day) => ({
      ...day,
      completionPercent: Math.min(100, Math.round(((day.minutes || 0) / dailyGoal) * 100))
    }));

    const totalMinutes = timelineWithCompletion.reduce((sum, day) => sum + day.minutes, 0);
    const activeDays = timelineWithCompletion.filter((day) => day.minutes > 0).length;

    let streak = 0;
    for (let i = timelineWithCompletion.length - 1; i >= 0; i -= 1) {
      if (timelineWithCompletion[i].minutes > 0) streak += 1;
      else break;
    }

    res.status(200).json({
      success: true,
      data: {
        timeline: timelineWithCompletion,
        totalMinutes,
        activeDays,
        averageMinutes: timelineWithCompletion.length ? Math.round(totalMinutes / timelineWithCompletion.length) : 0,
        streak
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline stats',
      error: error.message
    });
  }
};

// @desc    Get stored day-history docs for a date range
// @route   GET /api/sessions/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const end = req.query.endDate ? parseDateOnly(req.query.endDate) : new Date();
    const start = req.query.startDate ? parseDateOnly(req.query.startDate) : new Date(end);
    if (!req.query.startDate) {
      start.setDate(end.getDate() - 29);
    }

    const history = await StudyHistory.find({
      userId: req.user._id,
      date: {
        $gte: normalizeDay(start),
        $lte: normalizeDay(end)
      }
    })
      .populate('subjects.subjectId', 'name color')
      .sort({ date: 1 });

    const data = history.map((day) => ({
      date: toDateKey(day.date),
      totalMinutes: day.totalFocusMinutes,
      sessionCount: day.sessionCount,
      subjectBreakdown: day.subjects.map((subject) => ({
        subjectId: subject.subjectId?._id || null,
        name: subject.subjectId?.name || 'Subject',
        color: subject.subjectId?.color || '#3B82F6',
        minutes: subject.minutes,
        sessions: subject.sessions
      }))
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching study history',
      error: error.message
    });
  }
};

// @desc    Get overall stats
// @route   GET /api/pomodoro/stats/overall
// @access  Private
export const getOverallStats = async (req, res) => {
  try {
    const allHistory = await StudyHistory.find({ userId: req.user._id })
      .populate('subjects.subjectId', 'name color');

    const totalMinutes = allHistory.reduce((sum, day) => sum + (day.totalFocusMinutes || 0), 0);
    const totalSessions = allHistory.reduce((sum, day) => sum + (day.sessionCount || 0), 0);

    const subjectMap = {};
    allHistory.forEach((day) => {
      (day.subjects || []).forEach((subject) => {
        const key = String(subject.subjectId?._id || subject.subjectId);
        if (!subjectMap[key]) {
          subjectMap[key] = {
            name: subject.subjectId?.name || 'Subject',
            color: subject.subjectId?.color || '#3B82F6',
            minutes: 0,
            sessions: 0
          };
        }
        subjectMap[key].minutes += subject.minutes;
        subjectMap[key].sessions += subject.sessions;
      });
    });

    const today = normalizeDay(new Date());
    const todayHistory = allHistory.find((day) => normalizeDay(day.date).getTime() === today.getTime());
    const todayMinutes = todayHistory?.totalFocusMinutes || 0;
    const todaySessions = todayHistory?.sessionCount || 0;

    res.status(200).json({
      success: true,
      data: {
        totalMinutes,
        totalSessions,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        todayMinutes,
        todaySessions,
        averageSessionMinutes: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
        subjectBreakdown: Object.values(subjectMap).sort((a, b) => b.minutes - a.minutes)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching overall stats',
      error: error.message
    });
  }
};

// @desc    Delete session
// @route   DELETE /api/pomodoro/:id
// @access  Private
export const deleteSession = async (req, res) => {
  try {
    const session = await PomodoroSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.type === 'focus' && (session.duration > 0 || session.completed)) {
      if (session.duration > 0) {
        await applyFocusSessionToSubject({
          userId: req.user._id,
          subjectId: session.subjectId,
          duration: session.duration,
          direction: -1
        });
      }

      await applyFocusSessionToHistory({
        userId: req.user._id,
        subjectId: session.subjectId,
        duration: session.duration,
        date: session.date,
        direction: -1,
        countSession: Boolean(session.completed)
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting session',
      error: error.message
    });
  }
};
