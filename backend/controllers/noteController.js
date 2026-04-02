import Note from '../models/Note.js';

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const { subjectId, search } = req.query;
    
    const query = { userId: req.user._id };
    
    if (subjectId) {
      query.subjectId = subjectId;
    }
    
    let notes;
    
    if (search) {
      notes = await Note.find({
        ...query,
        $text: { $search: search }
      })
      .populate('subjectId', 'name color')
      .sort({ isPinned: -1, updatedAt: -1 });
    } else {
      notes = await Note.find(query)
        .populate('subjectId', 'name color')
        .sort({ isPinned: -1, updatedAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notes',
      error: error.message
    });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('subjectId', 'name color');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching note',
      error: error.message
    });
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  try {
    const { title, content, subjectId, category, tags, color } = req.body;

    if (!title || !content || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and subject are required'
      });
    }

    const note = await Note.create({
      userId: req.user._id,
      title,
      content,
      subjectId,
      category,
      tags,
      color
    });

    const populatedNote = await Note.findById(note._id).populate('subjectId', 'name color');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: populatedNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating note',
      error: error.message
    });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const { title, content, category, tags, color, isPinned } = req.body;

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    const updatedNote = await Note.findById(note._id).populate('subjectId', 'name color');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating note',
      error: error.message
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting note',
      error: error.message
    });
  }
};

// @desc    Toggle note pin
// @route   PUT /api/notes/:id/pin
// @access  Private
export const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    const updatedNote = await Note.findById(note._id).populate('subjectId', 'name color');

    res.status(200).json({
      success: true,
      message: 'Note pin toggled',
      data: updatedNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling pin',
      error: error.message
    });
  }
};
