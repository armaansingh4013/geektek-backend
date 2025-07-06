const mongoose = require('mongoose');

const workImageSchema = new mongoose.Schema({
  images: [{
    imageUrl: String,
    public_id: String
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
  shift: {
    type: String,
    enum: ['full_day', 'half_day'],
    default: 'full_day'
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  workImages: [workImageSchema]
});

// Pre-save middleware to calculate shift type
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const checkInTime = new Date(this.checkIn.time);
    const checkOutTime = new Date(this.checkOut.time);
    const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    
    if (hoursWorked < 3.5) {
      this.shift = 'half_day';
    } else if (hoursWorked >= 3.5 && hoursWorked < 6) {
      this.shift = 'half_day';
    } else if (hoursWorked >= 6 && hoursWorked <= 8) {
      this.shift = 'full_day';
    } else {
      // For hours worked > 8, still consider as full day
      this.shift = 'full_day';
    }
  }
  next();
});

// Indexes
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ 'checkIn.location': '2dsphere' });
attendanceSchema.index({ 'checkOut.location': '2dsphere' });

module.exports = mongoose.model('Attendance', attendanceSchema); 