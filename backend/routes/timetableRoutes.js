import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getTimetable, updateTimetable } from '../controllers/timetableController.js';

const router = express.Router();

router.get('/', protect, getTimetable);
router.put('/', protect, updateTimetable);

export default router;

