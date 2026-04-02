import Timetable from '../models/Timetable.js';

const buildDefaultSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour += 1) {
    slots.push({ hour, subjectId: null, label: '' });
  }
  return slots;
};

// @desc    Get timetable (repeats daily)
// @route   GET /api/timetable
// @access  Private
export const getTimetable = async (req, res) => {
  try {
    let timetable = await Timetable.findOne({ userId: req.user._id })
      .populate('slots.subjectId', 'name color');

    if (!timetable) {
      timetable = await Timetable.create({
        userId: req.user._id,
        slots: buildDefaultSlots(),
        repeatsDaily: true
      });
    }

    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
};

// @desc    Update timetable
// @route   PUT /api/timetable
// @access  Private
export const updateTimetable = async (req, res) => {
  try {
    const { slots, repeatsDaily } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: 'Slots array is required'
      });
    }

    const normalizedSlots = slots
      .filter((slot) => Number.isFinite(slot.hour) && slot.hour >= 0 && slot.hour <= 23)
      .map((slot) => ({
        hour: slot.hour,
        subjectId: slot.subjectId || null,
        label: slot.label || ''
      }));

    let timetable = await Timetable.findOne({ userId: req.user._id });
    if (!timetable) {
      timetable = await Timetable.create({
        userId: req.user._id,
        slots: normalizedSlots,
        repeatsDaily: repeatsDaily !== undefined ? repeatsDaily : true
      });
    } else {
      timetable.slots = normalizedSlots;
      if (repeatsDaily !== undefined) timetable.repeatsDaily = repeatsDaily;
      await timetable.save();
    }

    const populated = await Timetable.findById(timetable._id)
      .populate('slots.subjectId', 'name color');

    res.status(200).json({
      success: true,
      message: 'Timetable updated',
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating timetable',
      error: error.message
    });
  }
};

