import express from 'express';
import {
  getSessions,
  createSession,
  getDailyStats,
  getWeeklyStats,
  getRangeStats,
  getHistory,
  getOverallStats,
  deleteSession
} from '../controllers/pomodoroController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/stats/daily', protect, getDailyStats);
router.get('/stats/weekly', protect, getWeeklyStats);
router.get('/stats/range', protect, getRangeStats);
router.get('/stats/history', protect, getHistory);
router.get('/stats/overall', protect, getOverallStats);

router.route('/')
  .get(protect, getSessions)
  .post(protect, createSession);

router.delete('/:id', protect, deleteSession);

export default router;
