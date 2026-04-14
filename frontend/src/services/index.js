import api from './api';

// Note Service
export const noteService = {
  getAll: async (subjectId = null, search = null) => {
    const params = {};
    if (subjectId) params.subjectId = subjectId;
    if (search) params.search = search;
    const response = await api.get('/notes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  create: async (noteData) => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  update: async (id, noteData) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  togglePin: async (id) => {
    const response = await api.put(`/notes/${id}/pin`);
    return response.data;
  }
};

// Flashcard Service
export const flashcardService = {
  getAll: async (subjectId = null) => {
    const params = subjectId ? { subjectId } : {};
    const response = await api.get('/flashcards', { params });
    return response.data;
  },

  getDue: async (subjectId = null) => {
    const params = subjectId ? { subjectId } : {};
    const response = await api.get('/flashcards/due', { params });
    return response.data;
  },

  getStats: async (subjectId = null) => {
    const params = subjectId ? { subjectId } : {};
    const response = await api.get('/flashcards/stats', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/flashcards/${id}`);
    return response.data;
  },

  create: async (flashcardData) => {
    const response = await api.post('/flashcards', flashcardData);
    return response.data;
  },

  bulkCreate: async (flashcards) => {
    const response = await api.post('/flashcards/bulk', { flashcards });
    return response.data;
  },

  update: async (id, flashcardData) => {
    const response = await api.put(`/flashcards/${id}`, flashcardData);
    return response.data;
  },

  review: async (id, quality, rating = null) => {
    const payload = rating ? { rating } : { quality };
    const response = await api.post(`/flashcards/${id}/review`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/flashcards/${id}`);
    return response.data;
  }
};

// Pomodoro Service
export const pomodoroService = {
  getAll: async (startDate = null, endDate = null, subjectId = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (subjectId) params.subjectId = subjectId;
    const response = await api.get('/pomodoro', { params });
    return response.data;
  },

  create: async (sessionData) => {
    const response = await api.post('/pomodoro', sessionData);
    return response.data;
  },

  createSession: async (sessionData) => {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  getDailyStats: async (date = null) => {
    const params = date ? { date } : {};
    const response = await api.get('/pomodoro/stats/daily', { params });
    return response.data;
  },

  getWeeklyStats: async (startDate = null) => {
    const params = startDate ? { startDate } : {};
    const response = await api.get('/pomodoro/stats/weekly', { params });
    return response.data;
  },

  getRangeStats: async (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/pomodoro/stats/range', { params });
    return response.data;
  },

  getHistory: async (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/pomodoro/stats/history', { params });
    return response.data;
  },

  getOverallStats: async () => {
    const response = await api.get('/pomodoro/stats/overall');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pomodoro/${id}`);
    return response.data;
  }
};

// Timetable Service
export const timetableService = {
  get: async () => {
    const response = await api.get('/timetable');
    return response.data;
  },
  update: async (payload) => {
    const response = await api.put('/timetable', payload);
    return response.data;
  }
};
