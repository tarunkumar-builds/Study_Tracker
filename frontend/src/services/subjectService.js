import api from './api';

const subjectService = {
  // Subjects
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  update: async (id, subjectData) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  delete: async (id, password) => {
    const response = await api.delete(`/subjects/${id}`, { data: { password } });
    return response.data;
  },

  // Chapters
  addChapter: async (subjectId, chapterData) => {
    const response = await api.post(`/subjects/${subjectId}/chapters`, chapterData);
    return response.data;
  },

  updateChapter: async (subjectId, chapterId, chapterData) => {
    const response = await api.put(`/subjects/${subjectId}/chapters/${chapterId}`, chapterData);
    return response.data;
  },

  deleteChapter: async (subjectId, chapterId) => {
    const response = await api.delete(`/subjects/${subjectId}/chapters/${chapterId}`);
    return response.data;
  },

  // Topics
  addTopic: async (subjectId, chapterId, topicData) => {
    const response = await api.post(`/subjects/${subjectId}/chapters/${chapterId}/topics`, topicData);
    return response.data;
  },

  toggleTopic: async (subjectId, chapterId, topicId) => {
    const response = await api.put(`/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/toggle`);
    return response.data;
  },

  toggleTopicById: async (topicId) => {
    const response = await api.patch(`/topics/${topicId}/toggle`);
    return response.data;
  },

  updateTopicTime: async (subjectId, chapterId, topicId, duration) => {
    const response = await api.put(`/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/time`, { duration });
    return response.data;
  },

  deleteTopic: async (subjectId, chapterId, topicId) => {
    const response = await api.delete(`/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`);
    return response.data;
  }
};

export default subjectService;
