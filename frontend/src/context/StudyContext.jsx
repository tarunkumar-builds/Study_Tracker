import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import subjectService from '../services/subjectService';
import { flashcardService, noteService, pomodoroService } from '../services';
import { useAuth } from './AuthContext';

const StudyContext = createContext(null);

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within StudyProvider');
  }
  return context;
};

export const StudyProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [dailyTimeline, setDailyTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshSubjects = useCallback(async () => {
    const response = await subjectService.getAll();
    const data = Array.isArray(response.data) ? [...response.data].reverse() : [];
    setSubjects(data);
    return response.data || [];
  }, []);

  const refreshSessions = useCallback(async (date = null) => {
    if (date) {
      const response = await pomodoroService.getAll(date, date);
      setSessions(response.data || []);
      return response.data || [];
    }

    const response = await pomodoroService.getAll();
    setSessions(response.data || []);
    return response.data || [];
  }, []);

  const refreshNotes = useCallback(async () => {
    const response = await noteService.getAll();
    setNotes(response.data || []);
    return response.data || [];
  }, []);

  const refreshFlashcards = useCallback(async () => {
    const response = await flashcardService.getAll();
    setFlashcards(response.data || []);
    return response.data || [];
  }, []);

  const refreshDailyTimeline = useCallback(async (startDate = null, endDate = null) => {
    const response = await pomodoroService.getRangeStats(startDate, endDate);
    setDailyTimeline(response.data?.timeline || []);
    return response.data;
  }, []);

  const bootstrap = useCallback(async () => {
    if (!isAuthenticated) {
      setSubjects([]);
      setSessions([]);
      setNotes([]);
      setFlashcards([]);
      setDailyTimeline([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        refreshSubjects(),
        refreshSessions(),
        refreshNotes(),
        refreshFlashcards(),
        refreshDailyTimeline()
      ]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, refreshDailyTimeline, refreshFlashcards, refreshNotes, refreshSessions, refreshSubjects]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const addSubject = async (payload) => {
    const response = await subjectService.create(payload);
    await refreshSubjects();
    return response.data;
  };

  const toggleTopic = async ({ subjectId, chapterId, topicId }) => {
    const response = await subjectService.toggleTopic(subjectId, chapterId, topicId);
    setSubjects((prev) => prev.map((subject) => (
      subject._id === subjectId ? response.data : subject
    )));
    return response.data;
  };

  const addSession = async (payload) => {
    const response = await pomodoroService.createSession(payload);
    setSessions((prev) => [response.data, ...prev]);
    await Promise.all([
      refreshSubjects(),
      refreshDailyTimeline()
    ]);
    return response.data;
  };

  const addNote = async (payload) => {
    const response = await noteService.create(payload);
    setNotes((prev) => [response.data, ...prev]);
    return response.data;
  };

  const reviewCard = async ({ cardId, rating }) => {
    const response = await flashcardService.review(cardId, undefined, rating);
    setFlashcards((prev) => prev.map((card) => (
      card._id === cardId ? response.data : card
    )));
    return response.data;
  };

  const value = useMemo(() => ({
    subjects,
    sessions,
    notes,
    flashcards,
    dailyTimeline,
    loading,
    refreshSubjects,
    refreshSessions,
    refreshNotes,
    refreshFlashcards,
    addSubject,
    toggleTopic,
    addSession,
    addNote,
    reviewCard,
    refreshDailyTimeline
  }), [
    subjects,
    sessions,
    notes,
    flashcards,
    dailyTimeline,
    loading,
    refreshSubjects,
    refreshSessions,
    refreshNotes,
    refreshFlashcards,
    addSubject,
    addSession,
    addNote,
    reviewCard,
    toggleTopic,
    refreshDailyTimeline
  ]);

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};
