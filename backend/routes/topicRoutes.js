import express from 'express';
import { protect } from '../middlewares/auth.js';
import { toggleTopicById } from '../controllers/subjectController.js';

const router = express.Router();

// API contract alias: PATCH /api/topics/:id/toggle
router.patch('/:id/toggle', protect, toggleTopicById);

export default router;

