import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  hour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  label: {
    type: String,
    default: ''
  }
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  slots: {
    type: [slotSchema],
    default: []
  },
  repeatsDaily: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;

