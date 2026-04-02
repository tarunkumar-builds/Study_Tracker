import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import TimerCircle from '../components/TimerCircle';
import FocusMode from '../components/FocusMode';
import { useStudy } from '../context/StudyContext';
import { pomodoroService } from '../services';

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const MIN_MINUTES = 1;
const MAX_FOCUS_MINUTES = 180;
const MAX_BREAK_MINUTES = 60;

const Timer = () => {
  const { subjects, refreshSubjects, addSession } = useStudy();
  const [mode, setMode] = useState('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [todayStats, setTodayStats] = useState({ totalMinutes: 0, sessionCount: 0, subjectBreakdown: [] });
  const sessionStartRef = useRef(null);
  const pendingFocusSecondsRef = useRef(0);
  const flushInProgressRef = useRef(false);

  useEffect(() => {
    refreshSubjects();
  }, [refreshSubjects]);

  useEffect(() => {
    const loadTodayStats = async () => {
      try {
        const response = await pomodoroService.getDailyStats(new Date().toISOString().split('T')[0]);
        setTodayStats(response.data || { totalMinutes: 0, sessionCount: 0, subjectBreakdown: [] });
      } catch {
        // Silent fail: timer should still function even if stats request fails.
      }
    };
    loadTodayStats();
  }, []);

  useEffect(() => {
    if (subjects.length && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0]._id);
    }
  }, [selectedSubjectId, subjects]);

  const totalSeconds = useMemo(() => {
    return mode === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
  }, [mode, focusMinutes, breakMinutes]);

  const incrementTodayStats = (minutesToAdd = 0, sessionToAdd = 0, subjectId = null) => {
    setTodayStats((prev) => {
      const next = {
        ...prev,
        totalMinutes: Math.max(0, (prev.totalMinutes || 0) + minutesToAdd),
        sessionCount: Math.max(0, (prev.sessionCount || 0) + sessionToAdd),
        subjectBreakdown: [...(prev.subjectBreakdown || [])]
      };

      if (!subjectId || minutesToAdd <= 0) return next;

      const subject = subjects.find((item) => item._id === subjectId);
      const subjectName = subject?.name || 'Subject';
      const subjectColor = subject?.color || '#3B82F6';

      const existingIndex = next.subjectBreakdown.findIndex((item) => item.name === subjectName);
      if (existingIndex >= 0) {
        const current = next.subjectBreakdown[existingIndex];
        next.subjectBreakdown[existingIndex] = {
          ...current,
          minutes: Math.max(0, (current.minutes || 0) + minutesToAdd)
        };
      } else {
        next.subjectBreakdown.push({
          name: subjectName,
          color: subjectColor,
          minutes: minutesToAdd,
          sessions: 0
        });
      }

      return next;
    });
  };

  const refreshTodayStats = async () => {
    const daily = await pomodoroService.getDailyStats(new Date().toISOString().split('T')[0]);
    setTodayStats(daily.data || { totalMinutes: 0, sessionCount: 0, subjectBreakdown: [] });
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.setValueAtTime(0.08, context.currentTime);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
  };

  const flushPendingFocusSeconds = async ({ completed = false, discardRemainder = false } = {}) => {
    if (mode !== 'focus') return;
    if (flushInProgressRef.current) return;

    const fullMinutes = Math.floor(pendingFocusSecondsRef.current / 60);
    const persistableSeconds = fullMinutes * 60;

    if (persistableSeconds <= 0) {
      if (discardRemainder) {
        pendingFocusSecondsRef.current = 0;
      }
      return;
    }

    flushInProgressRef.current = true;
    pendingFocusSecondsRef.current -= persistableSeconds;

    try {
      await addSession({
        subjectId: selectedSubjectId || null,
        duration: fullMinutes,
        type: 'focus',
        completed,
        startTime: sessionStartRef.current || new Date(),
        endTime: new Date()
      });
      sessionStartRef.current = new Date();
      incrementTodayStats(fullMinutes, 0, selectedSubjectId || null);
    } catch {
      toast.error('Failed to record focus time');
      pendingFocusSecondsRef.current += persistableSeconds;
    } finally {
      if (discardRemainder) {
        pendingFocusSecondsRef.current = 0;
      }
      flushInProgressRef.current = false;
    }
  };

  const handleCycleComplete = async () => {
    setIsRunning(false);
    playBeep();

    if (mode === 'focus') {
      await flushPendingFocusSeconds({ completed: false, discardRemainder: true });
      try {
        // Completion marker: increments session count without adding extra minutes.
        await addSession({
          subjectId: selectedSubjectId || null,
          duration: 0,
          type: 'focus',
          completed: true,
          startTime: sessionStartRef.current || new Date(),
          endTime: new Date()
        });
        // Keep session count authoritative from backend to avoid UI double increments.
        await refreshTodayStats();
      } catch {
        toast.error('Failed to record session completion');
      }
      setMode('break');
      setRemainingSeconds(breakMinutes * 60);
      pendingFocusSecondsRef.current = 0;
      sessionStartRef.current = null;
      toast('Time for a break');
    } else {
      setMode('focus');
      setRemainingSeconds(focusMinutes * 60);
      sessionStartRef.current = null;
      toast('Break completed. Ready for next focus block');
    }
  };

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (mode === 'focus') {
          pendingFocusSecondsRef.current += 1;
          if (pendingFocusSecondsRef.current >= 60) {
            void flushPendingFocusSeconds({ completed: false, discardRemainder: false });
          }
        }

        if (prev <= 1) {
          clearInterval(timer);
          void handleCycleComplete();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode]);

  const handleDurationChange = (type, nextValue) => {
    const parsed = Number(nextValue);
    const max = type === 'focus' ? MAX_FOCUS_MINUTES : MAX_BREAK_MINUTES;
    const safe = Number.isFinite(parsed) ? Math.min(max, Math.max(MIN_MINUTES, parsed)) : MIN_MINUTES;

    if (type === 'focus') {
      setFocusMinutes(safe);
      if (mode === 'focus' && !isRunning) {
        setRemainingSeconds(safe * 60);
      }
      return;
    }

    setBreakMinutes(safe);
    if (mode === 'break' && !isRunning) {
      setRemainingSeconds(safe * 60);
    }
  };

  const handleStart = () => {
    if (mode === 'focus' && !selectedSubjectId) {
      toast.error('Select a subject first');
      return;
    }
    if (!isRunning) {
      sessionStartRef.current = new Date();
    }
    setIsRunning(true);
  };

  const handlePause = async () => {
    if (isRunning && mode === 'focus') {
      // Persist only whole minutes and drop leftover seconds.
      await flushPendingFocusSeconds({ completed: false, discardRemainder: true });
    }
    setIsRunning(false);
    sessionStartRef.current = null;
  };

  const handleReset = async () => {
    if (isRunning && mode === 'focus') {
      await flushPendingFocusSeconds({ completed: false, discardRemainder: true });
    }
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    pendingFocusSecondsRef.current = 0;
    sessionStartRef.current = null;
  };

  const handleSwitchMode = async (nextMode) => {
    if (isRunning && mode === 'focus' && nextMode !== 'focus') {
      await flushPendingFocusSeconds({ completed: false, discardRemainder: true });
    }
    setIsRunning(false);
    setMode(nextMode);
    const nextSeconds = nextMode === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
    setRemainingSeconds(nextSeconds);
    pendingFocusSecondsRef.current = 0;
    sessionStartRef.current = null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Pomodoro Timer</h1>
          <p className="text-gray-400 mt-1">Adjustable focus/break cycle with subject-linked session tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="btn-secondary p-2"
            title="Toggle sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={() => setFocusModeOpen(true)} className="btn-secondary p-2" title="Fullscreen focus mode">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="card space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSwitchMode('focus')}
                className={`rounded-lg py-2 ${mode === 'focus' ? 'bg-primary-600 text-white' : 'bg-dark-bg text-gray-300'}`}
              >
                Focus
              </button>
              <button
                onClick={() => handleSwitchMode('break')}
                className={`rounded-lg py-2 ${mode === 'break' ? 'bg-primary-600 text-white' : 'bg-dark-bg text-gray-300'}`}
              >
                Break
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(event) => setSelectedSubjectId(event.target.value)}
              className="input w-full"
              disabled={mode === 'break'}
            >
              {!subjects.length && <option value="">No subjects</option>}
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Focus (min)</label>
              <input
                type="number"
                min={MIN_MINUTES}
                max={MAX_FOCUS_MINUTES}
                value={focusMinutes}
                onChange={(event) => handleDurationChange('focus', event.target.value)}
                className="input w-full py-1.5"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Break (min)</label>
              <input
                type="number"
                min={MIN_MINUTES}
                max={MAX_BREAK_MINUTES}
                value={breakMinutes}
                onChange={(event) => handleDurationChange('break', event.target.value)}
                className="input w-full py-1.5"
                disabled={isRunning}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={handleStart} className="btn-primary flex items-center justify-center gap-2">
              <Play size={16} />
              Start
            </button>
            <button onClick={handlePause} className="btn-secondary flex items-center justify-center gap-2">
              <Pause size={16} />
              Pause
            </button>
            <button onClick={handleReset} className="btn-secondary flex items-center justify-center gap-2">
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        <div className="card flex items-center justify-center min-h-[420px]">
          <TimerCircle
            totalSeconds={totalSeconds}
            remainingSeconds={remainingSeconds}
            label={mode}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-3">Today&apos;s Study Time</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-dark-bg border border-dark-border p-3">
            <p className="text-xs text-gray-400">Focus Minutes</p>
            <p className="text-2xl font-bold text-white">
              {String(Math.floor((todayStats.totalMinutes || 0) / 60)).padStart(2, '0')}:
              {String(Math.round(todayStats.totalMinutes || 0) % 60).padStart(2, '0')}
            </p>
          </div>
          <div className="rounded-lg bg-dark-bg border border-dark-border p-3">
            <p className="text-xs text-gray-400">Focus Sessions</p>
            <p className="text-2xl font-bold text-white">{todayStats.sessionCount || 0}</p>
          </div>
        </div>
        <div className="space-y-2">
          {(todayStats.subjectBreakdown || []).map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-lg bg-dark-bg border border-dark-border px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || '#3B82F6' }} />
                <span className="text-sm text-gray-200">{item.name}</span>
              </div>
              <span className="text-sm text-gray-300">
                {String(Math.floor((item.minutes || 0) / 60)).padStart(2, '0')}:
                {String(Math.round(item.minutes || 0) % 60).padStart(2, '0')}
              </span>
            </div>
          ))}
          {(todayStats.subjectBreakdown || []).length === 0 && (
            <p className="text-sm text-gray-500">No focus sessions recorded today yet.</p>
          )}
        </div>
      </div>

      {focusModeOpen && (
        <FocusMode
          onClose={() => setFocusModeOpen(false)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          totalSeconds={totalSeconds}
          remainingSeconds={remainingSeconds}
          label={mode}
        />
      )}
    </div>
  );
};

export default Timer;
