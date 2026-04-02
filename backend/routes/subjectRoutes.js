import express from 'express';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addChapter,
  updateChapter,
  deleteChapter,
  addTopic,
  toggleTopicCompletion,
  updateTopicTime,
  deleteTopic,
  recalculateSubject
} from '../controllers/subjectController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Subject routes
router.route('/')
  .get(protect, getSubjects)
  .post(protect, createSubject);

router.route('/:id')
  .get(protect, getSubject)
  .put(protect, updateSubject)
  .delete(protect, deleteSubject);
router.post('/:id/recalculate', protect, recalculateSubject);

// Chapter routes
router.post('/:id/chapters', protect, addChapter);
router.put('/:id/chapters/:chapterId', protect, updateChapter);
router.delete('/:id/chapters/:chapterId', protect, deleteChapter);

// Topic routes
router.post('/:id/chapters/:chapterId/topics', protect, addTopic);
router.put('/:id/chapters/:chapterId/topics/:topicId/toggle', protect, toggleTopicCompletion);
router.put('/:id/chapters/:chapterId/topics/:topicId/time', protect, updateTopicTime);
router.delete('/:id/chapters/:chapterId/topics/:topicId', protect, deleteTopic);

export default router;
