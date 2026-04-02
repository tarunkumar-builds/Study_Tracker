import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';
import { pomodoroService } from '../services';
import { useStudy } from '../context/StudyContext';

const palette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

const formatTime = (minutes = 0) => {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  return `${hh}:${mm}`;
};

const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
};

const Analytics = () => {
  const { subjects, refreshSubjects } = useStudy();
  const [weekly, setWeekly] = useState([]);
  const [overall, setOverall] = useState({ subjectBreakdown: [] });
  const [timelineData, setTimelineData] = useState({ timeline: [], totalMinutes: 0, activeDays: 0, averageMinutes: 0, streak: 0 });
  const [rangeDays, setRangeDays] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await refreshSubjects();
        const [weeklyRes, overallRes] = await Promise.all([
          pomodoroService.getWeeklyStats(),
          pomodoroService.getOverallStats()
        ]);

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (rangeDays - 1));
        const rangeRes = await pomodoroService.getRangeStats(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        setWeekly(weeklyRes.data || []);
        setOverall(overallRes.data || { subjectBreakdown: [] });
        setTimelineData(rangeRes.data || { timeline: [], totalMinutes: 0, activeDays: 0, averageMinutes: 0, streak: 0 });
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rangeDays, refreshSubjects]);

  const completionTrendData = useMemo(() => {
    const timeline = timelineData.timeline || [];
    return timeline.map((day) => ({
      dayName: getDayName(day.date),
      completion: day.completionPercent || 0
    }));
  }, [timelineData.timeline]);

  const timelineChartData = useMemo(() => {
    return (timelineData.timeline || []).map((day) => ({
      ...day,
      dayName: getDayName(day.date)
    }));
  }, [timelineData.timeline]);

  const weeklyChartData = useMemo(() => {
    return (weekly || []).map((day) => ({
      ...day,
      dayName: getDayName(day.date)
    }));
  }, [weekly]);

  const subjectDistribution = useMemo(() => {
    const breakdown = overall.subjectBreakdown || [];
    return breakdown.map((item, index) => ({
      name: item.name,
      value: item.minutes,
      color: palette[index % palette.length]
    }));
  }, [overall.subjectBreakdown]);

  if (loading) {
    return (
      <div className="card text-center py-20 text-gray-400">Loading analytics...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Weekly study time, subject distribution, and completion trends.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-400">Range Minutes</p>
          <p className="text-2xl text-white font-bold">{formatTime(timelineData.totalMinutes || 0)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Active Days</p>
          <p className="text-2xl text-white font-bold">{timelineData.activeDays || 0}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Daily Average</p>
          <p className="text-2xl text-white font-bold">{formatTime(timelineData.averageMinutes || 0)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Current Streak</p>
          <p className="text-2xl text-white font-bold">{timelineData.streak || 0}d</p>
        </div>
      </div>

      <div className="card h-[320px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">Daily Study Timeline</h2>
          <select
            value={rangeDays}
            onChange={(event) => setRangeDays(Number(event.target.value))}
            className="input py-1.5"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height="86%">
          <BarChart data={timelineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="dayName" stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="minutes" fill="#06B6D4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card h-[360px]">
          <h2 className="text-lg font-semibold text-white mb-4">Weekly Study Time</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="dayName" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="minutes" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[360px]">
          <h2 className="text-lg font-semibold text-white mb-4">Subject Distribution</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={subjectDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {subjectDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color || palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card h-[360px]">
        <h2 className="text-lg font-semibold text-white mb-4">Completion Trends</h2>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={completionTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="dayName" stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line type="monotone" dataKey="completion" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
