const mongoose = require('mongoose');

const workImageSchema = new mongoose.Schema({
  images: [{
    type: String,
    required: true
  }],
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: Date,
    location: {
      type: { type: String},
      coordinates: [Number]
    },
    photo: String
  },
  checkOut: {
    time: Date,
    location: {
      type: { type: String },
      coordinates: [Number]
    },
    photo: String
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'early_exit', 'holiday'],
    default: 'absent'
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  workImages: [workImageSchema]
});

// Indexes
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ 'checkIn.location': '2dsphere' });
attendanceSchema.index({ 'checkOut.location': '2dsphere' });

module.exports = mongoose.model('Attendance', attendanceSchema); 