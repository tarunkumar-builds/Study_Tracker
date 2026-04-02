import express from 'express';
import {
  getFlashcards,
  getDueFlashcards,
  getFlashcardStats,
  getFlashcard,
  createFlashcard,
  updateFlashcard,
  reviewFlashcard,
  deleteFlashcard,
  bulkCreateFlashcards
} from '../controllers/flashcardController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/due', protect, getDueFlashcards);
router.get('/stats', protect, getFlashcardStats);
router.post('/bulk', protect, bulkCreateFlashcards);

router.route('/')
  .get(protect, getFlashcards)
  .post(protect, createFlashcard);

router.route('/:id')
  .get(protect, getFlashcard)
  .put(protect, updateFlashcard)
  .delete(protect, deleteFlashcard);

router.post('/:id/review', protect, reviewFlashcard);

export default router;
