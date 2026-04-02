import Flashcard from '../models/Flashcard.js';

// @desc    Get all flashcards for user
// @route   GET /api/flashcards
// @access  Private
export const getFlashcards = async (req, res) => {
  try {
    const { subjectId } = req.query;
    
    const query = { userId: req.user._id };
    
    if (subjectId) {
      query.subjectId = subjectId;
    }

    const flashcards = await Flashcard.find(query)
      .populate('subjectId', 'name color')
      .sort({ nextReviewDate: 1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching flashcards',
      error: error.message
    });
  }
};

// @desc    Get due flashcards
// @route   GET /api/flashcards/due
// @access  Private
export const getDueFlashcards = async (req, res) => {
  try {
    const { subjectId } = req.query;
    
    const flashcards = await Flashcard.getDueCards(req.user._id, subjectId);

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching due flashcards',
      error: error.message
    });
  }
};

// @desc    Get flashcard stats
// @route   GET /api/flashcards/stats
// @access  Private
export const getFlashcardStats = async (req, res) => {
  try {
    const { subjectId } = req.query;
    
    const query = { userId: req.user._id };
    if (subjectId) query.subjectId = subjectId;

    const allCards = await Flashcard.find(query);
    const dueCards = await Flashcard.getDueCards(req.user._id, subjectId);

    const totalReviews = allCards.reduce((sum, card) => sum + card.totalReviews, 0);
    const correctReviews = allCards.reduce((sum, card) => sum + card.correctReviews, 0);
    const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCards: allCards.length,
        dueCards: dueCards.length,
        totalReviews,
        correctReviews,
        accuracy,
        averageEaseFactor: allCards.length > 0 
          ? (allCards.reduce((sum, card) => sum + card.easeFactor, 0) / allCards.length).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching flashcard stats',
      error: error.message
    });
  }
};

// @desc    Get single flashcard
// @route   GET /api/flashcards/:id
// @access  Private
export const getFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('subjectId', 'name color');

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.status(200).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching flashcard',
      error: error.message
    });
  }
};

// @desc    Create new flashcard
// @route   POST /api/flashcards
// @access  Private
export const createFlashcard = async (req, res) => {
  try {
    const { question, answer, subjectId } = req.body;

    if (!question || !answer || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Question, answer, and subject are required'
      });
    }

    const flashcard = await Flashcard.create({
      userId: req.user._id,
      question,
      answer,
      subjectId
    });

    const populatedCard = await Flashcard.findById(flashcard._id)
      .populate('subjectId', 'name color');

    res.status(201).json({
      success: true,
      message: 'Flashcard created successfully',
      data: populatedCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating flashcard',
      error: error.message
    });
  }
};

// @desc    Update flashcard
// @route   PUT /api/flashcards/:id
// @access  Private
export const updateFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    const { question, answer } = req.body;

    if (question !== undefined) flashcard.question = question;
    if (answer !== undefined) flashcard.answer = answer;

    await flashcard.save();

    const updatedCard = await Flashcard.findById(flashcard._id)
      .populate('subjectId', 'name color');

    res.status(200).json({
      success: true,
      message: 'Flashcard updated successfully',
      data: updatedCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating flashcard',
      error: error.message
    });
  }
};

// @desc    Review flashcard (update spaced repetition)
// @route   POST /api/flashcards/:id/review
// @access  Private
export const reviewFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    const { quality, rating } = req.body; // quality: 0-5, rating: again|good|easy
    const mappedQuality = rating === 'again' ? 1 : rating === 'good' ? 4 : rating === 'easy' ? 5 : quality;

    if (mappedQuality === undefined || mappedQuality < 0 || mappedQuality > 5) {
      return res.status(400).json({
        success: false,
        message: 'Provide quality 0-5 or rating again/good/easy'
      });
    }

    flashcard.updateSpacedRepetition(mappedQuality);
    await flashcard.save();

    const updatedCard = await Flashcard.findById(flashcard._id)
      .populate('subjectId', 'name color');

    res.status(200).json({
      success: true,
      message: 'Review recorded successfully',
      data: updatedCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reviewing flashcard',
      error: error.message
    });
  }
};

// @desc    Delete flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    await flashcard.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting flashcard',
      error: error.message
    });
  }
};

// @desc    Bulk create flashcards
// @route   POST /api/flashcards/bulk
// @access  Private
export const bulkCreateFlashcards = async (req, res) => {
  try {
    const { flashcards } = req.body;

    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Flashcards array is required'
      });
    }

    const flashcardsWithUserId = flashcards.map(card => ({
      ...card,
      userId: req.user._id
    }));

    const createdCards = await Flashcard.insertMany(flashcardsWithUserId);

    res.status(201).json({
      success: true,
      message: `${createdCards.length} flashcards created successfully`,
      count: createdCards.length,
      data: createdCards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating flashcards',
      error: error.message
    });
  }
};
