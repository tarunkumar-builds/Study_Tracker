import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, CheckCircle2, Clock, Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ProgressRing from '../components/ProgressRing';
import ShareProgressCard from '../components/ShareProgressCard';
import { useStudy } from '../context/StudyContext';
import { timetableService } from '../services';
import { formatLocalDateInput, getDayName, getRecentDateKeys, parseDateInput } from '../utils/date';

const subjectColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];

const formatTime = (minutes = 0) => {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  return `${hh}:${mm}`;
};

const Dashboard = () => {
  const { subjects, refreshSubjects, addSubject, dailyTimeline, refreshDailyTimeline } = useStudy();
  const [selectedDate, setSelectedDate] = useState(formatLocalDateInput());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3B82F6' });
  const [timetableDate, setTimetableDate] = useState(formatLocalDateInput());
  const [timetableSlots, setTimetableSlots] = useState([]);

  const dates = useMemo(() => getRecentDateKeys(7), []);
  const dailyMap = useMemo(() => {
    const map = {};
    dailyTimeline.forEach((day) => {
      map[day.date] = day.minutes || 0;
    });
    return map;
  }, [dailyTimeline]);

  const weeklyChartData = useMemo(() => {
    return dailyTimeline.map((day) => ({
      ...day,
      dayName: getDayName(day.date)
    }));
  }, [dailyTimeline]);

  const selectedDay = useMemo(() => {
    return dailyTimeline.find((day) => day.date === selectedDate) || {
      date: selectedDate,
      minutes: 0,
      sessionCount: 0,
      subjectBreakdown: []
    };
  }, [dailyTimeline, selectedDate]);

  useEffect(() => {
    const load = async () => {
      try {
        await refreshSubjects();
        await refreshDailyTimeline(dates[0], dates[dates.length - 1]);
      } catch {
        toast.error('Failed to load subjects');
      }
    };
    load();
  }, [dates, refreshDailyTimeline, refreshSubjects]);

  const averageCompletion = subjects.length
    ? Math.round(subjects.reduce((sum, subject) => sum + (subject.completionPercentage || 0), 0) / subjects.length)
    : 0;

  const handleCreateSubject = async (event) => {
    event.preventDefault();
    if (!newSubject.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      await addSubject({ name: newSubject.name.trim(), color: newSubject.color });
      setShowAddModal(false);
      setNewSubject({ name: '', color: '#3B82F6' });
      toast.success('Subject created');
    } catch {
      toast.error('Failed to create subject');
    }
  };

  const loadTimetable = async () => {
    try {
      const response = await timetableService.get();
      const slots = response.data?.slots || [];
      if (slots.length === 0) {
        const defaultSlots = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          subjectId: null,
          label: ''
        }));
        setTimetableSlots(defaultSlots);
      } else {
        setTimetableSlots(slots.map((slot) => ({
          hour: slot.hour,
          subjectId: slot.subjectId?._id || slot.subjectId || null,
          label: slot.label || ''
        })));
      }
    } catch {
      toast.error('Failed to load timetable');
    }
  };

  const handleOpenTimetable = async () => {
    setShowTimetable(true);
    await loadTimetable();
  };

  const handleTimetableSlotChange = (hour, field, value) => {
    setTimetableSlots((prev) => prev.map((slot) => (
      slot.hour === hour ? { ...slot, [field]: value } : slot
    )));
  };

  const handleSaveTimetable = async () => {
    try {
      await timetableService.update({
        slots: timetableSlots,
        repeatsDaily: true
      });
      toast.success('Timetable saved');
      setShowTimetable(false);
    } catch {
      toast.error('Failed to save timetable');
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400">Track subject completion, daily focus, and progress sharing.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-primary-400" />
            <h2 className="text-white font-semibold">Date-wise Study Tracking</h2>
          </div>
          <button
            onClick={handleOpenTimetable}
            className="btn-secondary flex items-center gap-2 py-1.5"
            title="Open timetable"
          >
            <Calendar size={16} />
            Timetable
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {dates.map((date) => {
            const dateObj = parseDateInput(date);
            const active = date === selectedDate;
            const dayMinutes = dailyMap[date] || 0;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`min-w-[92px] rounded-xl px-3 py-2 text-left transition-all ${
                  active ? 'bg-primary-600 text-white' : 'bg-dark-bg text-gray-300 hover:bg-dark-hover'
                }`}
              >
                <p className="text-xs">{dateObj.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                <p className="font-semibold">{dateObj.getDate()}</p>
                <p className={`text-[10px] mt-1 ${active ? 'text-white/80' : 'text-gray-500'}`}>
                  {formatTime(dayMinutes)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-gray-400 text-sm">Total Subjects</p>
          <p className="text-3xl font-bold text-white mt-1">{subjects.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Study Time ({selectedDate})</p>
          <p className="text-3xl font-bold text-white mt-1">
            {formatTime(selectedDay.minutes)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{selectedDay.sessionCount || 0} focus sessions</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Overall Completion</p>
          <p className="text-3xl font-bold text-white mt-1">{averageCompletion}%</p>
        </div>
      </div>

      <div className="card h-[280px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Last 7 Days Trend</h2>
          <p className="text-sm text-gray-400">
            {dailyTimeline.reduce((sum, day) => sum + (day.minutes || 0), 0)}m total
          </p>
        </div>
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={weeklyChartData}>
            <XAxis dataKey="dayName" stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="minutes" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const completedTopics = (subject.chapters || []).reduce((sum, chapter) => {
            return sum + (chapter.topics || []).filter((topic) => topic.completed).length;
          }, 0);
          const totalTopics = (subject.chapters || []).reduce((sum, chapter) => sum + (chapter.topics || []).length, 0);

          return (
            <div key={subject._id} className="card-hover">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                  <p className="text-sm text-gray-400">{subject.chapters?.length || 0} chapters</p>
                </div>
                <ProgressRing
                  percentage={subject.completionPercentage || 0}
                  size={72}
                  strokeWidth={6}
                  color={subject.color || '#3B82F6'}
                />
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex items-center gap-2"><Clock size={14} /> {formatTime(subject.totalTimeSpent || 0)}</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={14} /> {completedTopics}/{totalTopics || 0} topics</p>
              </div>
              <Link to={`/subject/${subject._id}`} className="btn-secondary mt-4 inline-flex items-center gap-2">
                <BookOpen size={16} />
                Open
              </Link>
            </div>
          );
        })}
      </div>

      {!subjects.length && (
        <div className="card text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">No subjects yet</h3>
          <p className="text-gray-400 mb-4">Create your first subject to build your tracker.</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">Create Subject</button>
        </div>
      )}

      <ShareProgressCard subjects={subjects} />

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-md p-6">
            <h3 className="text-2xl font-display font-bold text-white mb-4">Add Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Subject Name</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(event) => setNewSubject((prev) => ({ ...prev, name: event.target.value }))}
                  className="input w-full"
                  placeholder="Operating Systems"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {subjectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewSubject((prev) => ({ ...prev, color }))}
                      className={`h-8 w-8 rounded-lg border ${
                        newSubject.color === color ? 'border-white' : 'border-transparent'
                      }`}
                    >
                      <span className={`block h-full w-full rounded-md ${
                        color === '#3B82F6' ? 'bg-blue-500' :
                        color === '#10B981' ? 'bg-emerald-500' :
                        color === '#F59E0B' ? 'bg-amber-500' :
                        color === '#EF4444' ? 'bg-red-500' :
                        color === '#8B5CF6' ? 'bg-violet-500' :
                        color === '#EC4899' ? 'bg-pink-500' :
                        color === '#06B6D4' ? 'bg-cyan-500' : 'bg-teal-500'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTimetable && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-2xl font-display font-bold text-white">Daily Timetable</h3>
                <p className="text-sm text-gray-400">Repeats every day. Edit slots anytime.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={timetableDate}
                  onChange={(event) => setTimetableDate(event.target.value)}
                  className="input py-1.5"
                />
                <button onClick={handleSaveTimetable} className="btn-primary">Save</button>
                <button onClick={() => setShowTimetable(false)} className="btn-secondary">Close</button>
              </div>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {timetableSlots.map((slot) => (
                <div key={slot.hour} className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center">
                  <div className="text-xs text-gray-400">
                    {String(slot.hour).padStart(2, '0')}:00
                  </div>
                  <select
                    value={slot.subjectId || ''}
                    onChange={(event) => handleTimetableSlotChange(slot.hour, 'subjectId', event.target.value || null)}
                    className="input py-1.5"
                  >
                    <option value="">Free</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>{subject.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={slot.label || ''}
                    onChange={(event) => handleTimetableSlotChange(slot.hour, 'label', event.target.value)}
                    placeholder="Topic or note"
                    className="input py-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
