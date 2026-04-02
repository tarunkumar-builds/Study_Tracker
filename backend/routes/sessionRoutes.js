import express from 'express';
import { protect } from '../middlewares/auth.js';
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

const router = express.Router();

router.get('/daily', protect, getDailyStats);
router.get('/weekly', protect, getWeeklyStats);
router.get('/range', protect, getRangeStats);
router.get('/history', protect, getHistory);
router.get('/overall', protect, getOverallStats);

router.route('/')
  .get(protect, getSessions)
  .post(protect, createSession);

router.delete('/:id', protect, deleteSession);

export default router;
