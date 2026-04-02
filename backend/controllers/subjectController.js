import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { recalculateSubjectProgress } from '../utils/progressUtils.js';

const getChapterTitle = (payload = {}) => payload.title?.trim() || payload.name?.trim() || '';
const getTopicTitle = (payload = {}) => payload.title?.trim() || payload.name?.trim() || '';

// @desc    Get all subjects for user
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({
      userId: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: error.message
    });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required'
      });
    }

    const subject = await Subject.create({
      userId: req.user._id,
      name,
      color: req.body.color || '#3B82F6'
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error.message
    });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (req.body.name?.trim()) subject.name = req.body.name.trim();
    if (req.body.color) subject.color = req.body.color;

    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subject',
      error: error.message
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
export const deleteSubject = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete a subject'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    subject.isActive = false;
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting subject',
      error: error.message
    });
  }
};

// @desc    Add chapter to subject
// @route   POST /api/subjects/:id/chapters
// @access  Private
export const addChapter = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const title = getChapterTitle(req.body);
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Chapter title is required'
      });
    }

    subject.chapters.push({ title, name: title, topics: [] });
    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(201).json({
      success: true,
      message: 'Chapter added successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding chapter',
      error: error.message
    });
  }
};

// @desc    Update chapter
// @route   PUT /api/subjects/:id/chapters/:chapterId
// @access  Private
export const updateChapter = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const chapter = subject.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const title = getChapterTitle(req.body);
    if (title) {
      chapter.title = title;
      chapter.name = title;
    }

    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Chapter updated successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating chapter',
      error: error.message
    });
  }
};

// @desc    Delete chapter
// @route   DELETE /api/subjects/:id/chapters/:chapterId
// @access  Private
export const deleteChapter = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    subject.chapters.pull(req.params.chapterId);
    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting chapter',
      error: error.message
    });
  }
};

// @desc    Add topic to chapter
// @route   POST /api/subjects/:id/chapters/:chapterId/topics
// @access  Private
export const addTopic = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const chapter = subject.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const title = getTopicTitle(req.body);
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Topic title is required'
      });
    }

    chapter.topics.push({ title, name: title });
    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(201).json({
      success: true,
      message: 'Topic added successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding topic',
      error: error.message
    });
  }
};

// @desc    Toggle topic completion
// @route   PUT /api/subjects/:id/chapters/:chapterId/topics/:topicId/toggle
// @access  Private
export const toggleTopicCompletion = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const chapter = subject.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const topic = chapter.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    topic.completed = !topic.completed;
    topic.lastStudied = new Date();

    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Topic completion toggled',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling topic',
      error: error.message
    });
  }
};

// @desc    Toggle topic completion with topic id only
// @route   PATCH /api/topics/:id/toggle
// @access  Private
export const toggleTopicById = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      userId: req.user._id,
      isActive: true,
      'chapters.topics._id': req.params.id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    let toggledTopic = null;
    subject.chapters.forEach((chapter) => {
      const topic = chapter.topics.id(req.params.id);
      if (topic) {
        topic.completed = !topic.completed;
        topic.lastStudied = new Date();
        toggledTopic = topic;
      }
    });

    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Topic completion toggled',
      data: {
        subject,
        topic: toggledTopic
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling topic',
      error: error.message
    });
  }
};

// @desc    Update topic time
// @route   PUT /api/subjects/:id/chapters/:chapterId/topics/:topicId/time
// @access  Private
export const updateTopicTime = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const chapter = subject.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    const topic = chapter.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    const duration = Number(req.body.timeSpent ?? req.body.duration ?? req.body.durationSpent ?? 0);
    if (Number.isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'timeSpent must be a positive number'
      });
    }

    topic.timeSpent = Number(topic.timeSpent ?? topic.durationSpent ?? 0) + duration;
    topic.durationSpent = topic.timeSpent;
    topic.lastStudied = new Date();

    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Topic time updated',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating topic time',
      error: error.message
    });
  }
};

// @desc    Delete topic
// @route   DELETE /api/subjects/:id/chapters/:chapterId/topics/:topicId
// @access  Private
export const deleteTopic = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const chapter = subject.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    chapter.topics.pull(req.params.topicId);
    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting topic',
      error: error.message
    });
  }
};

// @desc    Force recalculate subject progress
// @route   POST /api/subjects/:id/recalculate
// @access  Private
export const recalculateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    recalculateSubjectProgress(subject);
    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject progress recalculated',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recalculating subject progress',
      error: error.message
    });
  }
};
