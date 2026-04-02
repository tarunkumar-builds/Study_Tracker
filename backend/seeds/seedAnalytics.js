import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import StudyHistory from '../models/StudyHistory.js';
import PomodoroSession from '../models/PomodoroSession.js';

dotenv.config();

const buildDates = (days = 7) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
};

const seedAnalytics = async () => {
  try {
    await connectDB();

    const email = process.env.SEED_EMAIL || 'test@example.com';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email,
        password: 'password123'
      });
    }

    let subjects = await Subject.find({ userId: user._id, isActive: true });
    if (!subjects.length) {
      subjects = await Subject.create([
        { userId: user._id, name: 'Anatomy', color: '#F472B6' },
        { userId: user._id, name: 'Biology', color: '#60A5FA' },
        { userId: user._id, name: 'Chemistry', color: '#34D399' }
      ]);
    }

    // Enrich subjects with heavier preparation time and completion based on time spent.
    for (const subject of subjects) {
      if (!subject.chapters || subject.chapters.length === 0) {
        subject.chapters = [
          {
            title: 'Foundations',
            topics: [
              { title: 'Overview', timeSpent: 120, completed: true },
              { title: 'Key Terms', timeSpent: 90, completed: false },
              { title: 'Practice', timeSpent: 150, completed: true }
            ]
          },
          {
            title: 'Advanced',
            topics: [
              { title: 'Deep Dive', timeSpent: 180, completed: true },
              { title: 'Case Studies', timeSpent: 80, completed: false }
            ]
          }
        ];
      } else {
        subject.chapters.forEach((chapter) => {
          chapter.topics = (chapter.topics || []).map((topic) => {
            const boosted = Math.max(60, Number(topic.timeSpent || topic.durationSpent || 0) + 90);
            return {
              ...topic,
              timeSpent: boosted,
              durationSpent: boosted,
              completed: boosted >= 120
            };
          });
        });
      }
      await subject.save();
    }

    const dates = buildDates(7);
    const baseMinutes = [65, 80, 95, 120, 150, 110, 140];

    for (let i = 0; i < dates.length; i += 1) {
      const day = dates[i];
      const totalMinutes = baseMinutes[i % baseMinutes.length] + 40;
      const subjectSplits = [
        Math.round(totalMinutes * 0.5),
        Math.round(totalMinutes * 0.3),
        totalMinutes - Math.round(totalMinutes * 0.5) - Math.round(totalMinutes * 0.3)
      ];

      const subjectsPayload = subjects.slice(0, 3).map((subject, index) => ({
        subjectId: subject._id,
        minutes: subjectSplits[index] || 0,
        sessions: Math.max(1, Math.round(subjectSplits[index] / 25))
      }));

      await StudyHistory.findOneAndUpdate(
        { userId: user._id, date: day },
        {
          userId: user._id,
          date: day,
          totalFocusMinutes: totalMinutes,
          sessionCount: subjectsPayload.reduce((sum, item) => sum + item.sessions, 0),
          subjects: subjectsPayload
        },
        { upsert: true, new: true }
      );

      // Create a few sessions for realism
      await PomodoroSession.create({
        userId: user._id,
        subjectId: subjectsPayload[0]?.subjectId || subjects[0]._id,
        duration: 25,
        type: 'focus',
        completed: true,
        date: day,
        startTime: new Date(day.getTime() + 9 * 3600000),
        endTime: new Date(day.getTime() + 9.5 * 3600000)
      });
    }

    // Update subject timer time based on history
    for (const subject of subjects) {
      const total = await StudyHistory.aggregate([
        { $match: { userId: user._id, 'subjects.subjectId': subject._id } },
        { $unwind: '$subjects' },
        { $match: { 'subjects.subjectId': subject._id } },
        { $group: { _id: '$subjects.subjectId', minutes: { $sum: '$subjects.minutes' } } }
      ]);
      subject.timerTimeSpent = total[0]?.minutes || 0;
      await subject.save();
    }

    console.log('✅ Analytics seed complete for', email);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAnalytics();
